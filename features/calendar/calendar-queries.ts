import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { isSlowEnabled } from '@/components/demo/demo-slow';
import { verifyAuth } from '@/features/user/user-queries';
import { prisma } from '@/lib/db';
import { delay } from '@/lib/utils';
import { dateKey, getMonthDays, getWeekDays, isDateKey } from './calendar-utils';
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
  Personal: 'pink',
  'Side project': 'violet',
  Work: 'blue',
};

function calendarColor(calendar: { color: string; isDemo: boolean; name: string }) {
  return calendar.isDemo ? (DEMO_CALENDAR_COLORS[calendar.name] ?? 'blue') : (calendar.color as CalendarColor);
}

async function getCurrentUserId() {
  const user = await verifyAuth();
  return user.id;
}

export async function getCalendars(): Promise<Calendar[]> {
  const userId = await getCurrentUserId();
  return getCalendarsForUser(userId);
}

async function getCalendarsForUser(userId: string | null): Promise<Calendar[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(calendarCache.calendarsTag);

  const rows = await prisma.calendar.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    where: { OR: [{ userId }, { userId: null }] },
  });

  return rows.map(calendar => ({
    color: calendarColor(calendar),
    id: calendar.id,
    isDemo: calendar.isDemo,
    name: calendar.name,
  }));
}

export async function getCalendarWeek(date: string): Promise<CalendarRange> {
  if (!isDateKey(date)) notFound();

  const userId = await getCurrentUserId();
  const days = getWeekDays(date);
  return getCalendarRangeForUser(days, userId, await isSlowEnabled(), calendarCache.weekTag(days[0]));
}

export async function getCalendarMonth(date: string): Promise<CalendarRange> {
  if (!isDateKey(date)) notFound();

  const userId = await getCurrentUserId();
  const days = getMonthDays(date);
  return getCalendarRangeForUser(days, userId, await isSlowEnabled(), `calendar-month:${date.slice(0, 7)}`);
}

async function getCalendarRangeForUser(
  days: string[],
  userId: string | null,
  slow: boolean,
  rangeTag: string,
): Promise<CalendarRange> {
  'use cache';
  const start = days[0];

  cacheLife('hours');
  cacheTag(calendarCache.tag, rangeTag);

  await delay(650, slow);
  const rangeEnd = new Date(`${days.at(-1)}T00:00:00.000Z`);
  rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);
  const [rows, bookingRows] = await Promise.all([
    prisma.calendarEvent.findMany({
      include: { calendar: { select: { color: true, isDemo: true, name: true } } },
      orderBy: [{ start: 'asc' }, { title: 'asc' }],
      where: { OR: [{ userId }, { userId: null }] },
    }),
    userId
      ? prisma.booking.findMany({
          include: { bookingPage: { select: { duration: true, title: true, userId: true } } },
          where: {
            bookingPage: { userId },
            startsAt: {
              gte: new Date(`${days[0]}T00:00:00.000Z`),
              lt: rangeEnd,
            },
          },
        })
      : [],
  ]);
  const bookingMatches = createBookingMatches(bookingRows);

  return {
    days,
    events: rows.flatMap(event => expandEvent(event, days, bookingMatches)),
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
    isDemo: event.demo,
    recurrence: event.recurrence,
    sourceId: event.id,
    start: event.start,
    title: event.title,
  };
}
