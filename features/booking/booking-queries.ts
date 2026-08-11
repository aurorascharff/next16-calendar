import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { DEMO_DELAYS, isSlowEnabled } from '@/components/demo/demo-slow';
import { calendarCache } from '@/features/calendar/calendar-queries';
import { dateKey, isDateKey, timeToMinutes } from '@/features/calendar/calendar-utils';
import { verifyAuth } from '@/features/user/user-queries';
import { prisma } from '@/lib/db';
import { delay } from '@/lib/utils';

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function slotsBetween(startTime: string, endTime: string, duration: number) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return Array.from({ length: Math.max(0, Math.floor((end - start) / duration)) }, (_, index) => {
    const minutes = start + index * duration;
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  });
}

function occursOn(event: { day: Date; recurrence: string | null }, day: string) {
  if (!event.recurrence) return dateKey(event.day) === day;
  const weekday = new Date(`${day}T00:00:00.000Z`).getUTCDay();
  if (event.recurrence === 'weekday') return weekday >= 1 && weekday <= 5;
  return event.recurrence === WEEKDAY_NAMES[weekday];
}

export type BookingSlot = { reason: 'booked' | 'calendar' | null; taken: boolean; time: string };

export const bookingCache = {
  tag: (handle: string) => `booking:${handle}`,
};

export async function getPublicBookingMetadata(handle: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(bookingCache.tag(handle));

  return prisma.bookingPage.findFirst({
    select: { active: true, duration: true, title: true },
    where: { active: true, handle },
  });
}

export async function getBookingAvailability(handle: string, date: string) {
  return getBookingAvailabilityCached(handle, date, await isSlowEnabled());
}

async function getBookingAvailabilityCached(handle: string, date: string, slow: boolean) {
  'use cache';
  cacheLife({ stale: 30 });
  cacheTag(bookingCache.tag(handle));

  await delay(DEMO_DELAYS.bookingAvailability, slow);
  const bookingPage = await prisma.bookingPage.findUnique({
    include: { user: { select: { id: true, name: true } } },
    where: { handle },
  });

  if (!bookingPage || !bookingPage.active) notFound();
  if (!isDateKey(date)) notFound();

  const day = date;
  const dayStart = new Date(`${day}T00:00:00.000Z`);
  const dayEnd = new Date(`${day}T23:59:59.999Z`);

  const [bookings, events] = await Promise.all([
    prisma.booking.findMany({
      select: { startsAt: true },
      where: { bookingPageId: bookingPage.id, startsAt: { gte: dayStart, lte: dayEnd } },
    }),
    prisma.calendarEvent.findMany({
      select: { allDay: true, day: true, duration: true, recurrence: true, start: true },
      where: { OR: [{ userId: bookingPage.user.id }, { userId: null }] },
    }),
  ]);
  const calendarId =
    bookingPage.calendarId ??
    (
      await prisma.calendar.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true },
        where: { isDemo: false, userId: bookingPage.user.id },
      })
    )?.id ??
    null;

  const bookedMinutes = new Set(
    bookings.map(booking => booking.startsAt.getUTCHours() * 60 + booking.startsAt.getUTCMinutes()),
  );
  const busy = events
    .filter(event => occursOn(event, day))
    .map(event => {
      if (event.allDay) return { end: 24 * 60, start: 0 };
      const start = timeToMinutes(event.start);
      return { end: start + event.duration, start };
    });

  const slots: BookingSlot[] = slotsBetween(bookingPage.startTime, bookingPage.endTime, bookingPage.duration).map(
    time => {
      const start = timeToMinutes(time);
      const end = start + bookingPage.duration;
      const booked = bookedMinutes.has(start);
      const unavailable = busy.some(block => start < block.end && end > block.start);
      return { reason: booked ? 'booked' : unavailable ? 'calendar' : null, taken: booked || unavailable, time };
    },
  );

  return {
    day,
    duration: bookingPage.duration,
    endTime: bookingPage.endTime,
    handle: bookingPage.handle,
    hasCalendar: Boolean(calendarId),
    name: bookingPage.user.name,
    slots,
    startTime: bookingPage.startTime,
    title: bookingPage.title,
  };
}

export async function getMyBookingProfile() {
  const user = await verifyAuth();
  return getMyBookingProfileForUser(user.handle, await isSlowEnabled());
}

async function getMyBookingProfileForUser(handle: string, slow: boolean) {
  'use cache';
  cacheLife('hours');
  cacheTag(bookingCache.tag(handle), calendarCache.calendarsTag);

  await delay(DEMO_DELAYS.bookingProfile, slow);
  const bookingPage = await prisma.bookingPage.findUnique({ where: { handle } });
  if (!bookingPage) return null;

  const calendar = bookingPage.calendarId
    ? await prisma.calendar.findFirst({
        select: { id: true },
        where: { id: bookingPage.calendarId, isDemo: false, userId: bookingPage.userId },
      })
    : await prisma.calendar.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true },
        where: { isDemo: false, userId: bookingPage.userId },
      });

  return {
    active: bookingPage.active,
    duration: bookingPage.duration,
    endTime: bookingPage.endTime,
    handle: bookingPage.handle,
    hasCalendar: Boolean(calendar),
    startTime: bookingPage.startTime,
    title: bookingPage.title,
  };
}

async function getWritableCalendars(userId: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(calendarCache.calendarsTag);

  return prisma.calendar.findMany({
    orderBy: { createdAt: 'desc' },
    select: { color: true, id: true, name: true },
    where: { isDemo: false, userId },
  });
}

export async function getMyBookingSettings() {
  const user = await verifyAuth();
  return getMyBookingSettingsForUser(user.id, user.handle, await isSlowEnabled());
}

async function getMyBookingSettingsForUser(userId: string, handle: string, slow: boolean) {
  'use cache';
  cacheLife('hours');
  cacheTag(bookingCache.tag(handle), calendarCache.calendarsTag);

  await delay(DEMO_DELAYS.bookingSettings, slow);
  const calendars = await getWritableCalendars(userId);
  const bookingPage = await prisma.bookingPage.findFirst({ where: { handle, userId } });
  if (!bookingPage) {
    return {
      active: true,
      calendarId: calendars[0]?.id ?? '',
      calendars,
      duration: 30,
      endTime: '16:00',
      handle,
      startTime: '09:30',
      title: 'A focused 30 minute conversation',
    };
  }

  return {
    active: bookingPage.active,
    calendarId: bookingPage.calendarId ?? calendars[0]?.id ?? '',
    calendars,
    duration: bookingPage.duration,
    endTime: bookingPage.endTime,
    handle: bookingPage.handle,
    startTime: bookingPage.startTime,
    title: bookingPage.title,
  };
}
