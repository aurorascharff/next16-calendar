import 'server-only';

import { notFound } from 'next/navigation';
import { isSlowEnabled } from '@/components/demo/demo-slow';
import { verifyAuth } from '@/features/user/user-queries';
import { prisma } from '@/lib/db';
import { dateKey, getMonthDays, getWeekDays, isDateKey, shiftDay } from './calendar-utils';
import type { Calendar, CalendarColor, CalendarEvent, CalendarRange } from './types/calendar';

export const calendarCache = {
  calendarsTag: 'calendars',
  tag: 'calendar-events',
  weekTag: (start: string) => `calendar-week:${start}`,
};

type StoredEvent = {
  allDay: boolean;
  calendar: { color: string; isDemo: boolean; name: string };
  calendarId: string;
  day: Date;
  demo: boolean;
  description: string | null;
  duration: number;
  id: string;
  recurrence: string | null;
  start: string;
  title: string;
  userId: string | null;
};

type BookingMatch = {
  bookingPage: {
    duration: number;
    title: string;
    userId: string;
  };
  startsAt: Date;
};

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DEMO_CALENDAR_COLORS: Record<string, CalendarColor> = {
  Personal: 'cyan',
  'Side project': 'violet',
  Work: 'blue',
};

function calendarColor(calendar: { color: string; isDemo: boolean; name: string }) {
  return calendar.isDemo ? (DEMO_CALENDAR_COLORS[calendar.name] ?? 'blue') : (calendar.color as CalendarColor);
}

export async function getCalendars(): Promise<Calendar[]> {
  const { id: userId } = await verifyAuth();
  return getCalendarsForUser(userId, await isSlowEnabled());
}

export function getCalendarDate(date: string) {
  if (!isDateKey(date)) notFound();
  return date;
}

async function getCalendarsForUser(userId: string, slow: boolean): Promise<Calendar[]> {
  const [, rows] = await Promise.all([
    slow ? prisma.$queryRaw`SELECT pg_sleep(0.4) IS NULL AS slept` : undefined,
    prisma.calendar.findMany({
      orderBy: [{ isDemo: 'asc' }, { createdAt: 'desc' }, { id: 'desc' }],
      where: { OR: [{ userId }, { userId: null }] },
    }),
  ]);

  return rows.map(calendar => ({
    color: calendarColor(calendar),
    id: calendar.id,
    name: calendar.name,
  }));
}

export async function getCalendarWeek(date: string): Promise<CalendarRange> {
  if (!isDateKey(date)) notFound();

  const { id: userId } = await verifyAuth();
  const days = getWeekDays(date);
  return getCalendarRangeForUser(days, userId, await isSlowEnabled(), true);
}

export async function getCalendarMonth(date: string): Promise<CalendarRange> {
  if (!isDateKey(date)) notFound();

  const { id: userId } = await verifyAuth();
  const days = getMonthDays(date);
  return getCalendarRangeForUser(days, userId, await isSlowEnabled());
}

async function getCalendarRangeForUser(
  days: string[],
  userId: string,
  slow: boolean,
  includeFollowingDay = false,
): Promise<CalendarRange> {
  const start = days[0];
  const eventDays = includeFollowingDay ? [...days, shiftDay(days.at(-1)!, 1)] : days;
  const rangeEnd = new Date(`${eventDays.at(-1)}T00:00:00.000Z`);
  rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);
  const [, rows, bookingRows] = await Promise.all([
    slow ? prisma.$queryRaw`SELECT pg_sleep(1.1) IS NULL AS slept` : undefined,
    prisma.calendarEvent.findMany({
      include: { calendar: { select: { color: true, isDemo: true, name: true } } },
      orderBy: [{ start: 'asc' }, { title: 'asc' }],
      where: { OR: [{ userId }, { userId: null }] },
    }),
    prisma.booking.findMany({
      include: { bookingPage: { select: { duration: true, title: true, userId: true } } },
      where: {
        bookingPage: { userId },
        startsAt: {
          gte: new Date(`${days[0]}T00:00:00.000Z`),
          lt: rangeEnd,
        },
      },
    }),
  ]);
  const bookingMatches = createBookingMatches(bookingRows);

  return {
    days,
    events: rows.flatMap(event => expandEvent(event, eventDays, bookingMatches)),
    start,
  };
}

function bookingKey({
  day,
  duration,
  start,
  title,
  userId,
}: {
  day: string;
  duration: number;
  start: string;
  title: string;
  userId: string | null;
}) {
  return `${userId ?? ''}:${day}:${start}:${duration}:${title}`;
}

function createBookingMatches(bookings: BookingMatch[]) {
  return new Set(
    bookings.map(booking =>
      bookingKey({
        day: dateKey(booking.startsAt),
        duration: booking.bookingPage.duration,
        start: `${String(booking.startsAt.getUTCHours()).padStart(2, '0')}:${String(booking.startsAt.getUTCMinutes()).padStart(2, '0')}`,
        title: booking.bookingPage.title,
        userId: booking.bookingPage.userId,
      }),
    ),
  );
}

function expandEvent(event: StoredEvent, days: string[], bookingMatches: Set<string>): CalendarEvent[] {
  const recurrence = event.recurrence;

  if (!recurrence) {
    const day = dateKey(event.day);
    return days.includes(day) ? [toCalendarEvent(event, day, bookingMatches)] : [];
  }

  return days.flatMap(day =>
    matchesRecurrence(recurrence, day)
      ? [
          {
            ...toCalendarEvent(event, day, bookingMatches),
            id: `${event.id}:${day}`,
            recurring: Boolean(event.recurrence),
          },
        ]
      : [],
  );
}

function matchesRecurrence(recurrence: string, day: string) {
  const weekday = new Date(`${day}T00:00:00.000Z`).getUTCDay();
  return recurrence === 'weekday' ? weekday >= 1 && weekday <= 5 : recurrence === WEEKDAY_NAMES[weekday];
}

function toCalendarEvent(event: StoredEvent, day: string, bookingMatches: Set<string>): CalendarEvent {
  return {
    calendarId: event.calendarId,
    allDay: event.allDay,
    color: calendarColor(event.calendar),
    day,
    description: event.description,
    duration: event.duration,
    id: event.id,
    isBooking: bookingMatches.has(
      bookingKey({ day, duration: event.duration, start: event.start, title: event.title, userId: event.userId }),
    ),
    recurrence: event.recurrence,
    sourceId: event.id,
    start: event.start,
    title: event.title,
  };
}
