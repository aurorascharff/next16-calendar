'use server';

import { dateKey, isDateKey, timeToMinutes } from '@/features/calendar/calendar-utils';
import { getCurrentUser } from '@/features/user/user-queries';
import { prisma } from '@/lib/db';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

type AvailabilityInput = {
  active: boolean;
  duration: number;
  endTime: string;
  startTime: string;
  title: string;
};

function occursOn(event: { day: Date; recurrence: string | null }, day: string) {
  if (!event.recurrence) return dateKey(event.day) === day;
  const weekday = new Date(`${day}T00:00:00.000Z`).getUTCDay();
  if (event.recurrence === 'weekday') return weekday >= 1 && weekday <= 5;
  return event.recurrence === WEEKDAY_NAMES[weekday];
}

export async function bookSlot({
  day,
  guestName,
  handle,
  slot,
}: {
  day: string;
  guestName: string;
  handle: string;
  slot: string;
}) {
  if (!isDateKey(day) || !timePattern.test(slot)) {
    return { error: 'Choose a valid booking time.' };
  }

  const bookingPage = await prisma.bookingPage.findUnique({ where: { handle } });
  if (!bookingPage || !bookingPage.active) {
    return { error: 'This booking page is not available.' };
  }

  const start = timeToMinutes(slot);
  const end = start + bookingPage.duration;

  const events = await prisma.calendarEvent.findMany({
    select: { allDay: true, day: true, duration: true, recurrence: true, start: true },
    where: { OR: [{ userId: bookingPage.userId }, { userId: null }] },
  });
  const conflicts = events.some(event => {
    if (!occursOn(event, day)) return false;
    if (event.allDay) return true;
    const eventStart = timeToMinutes(event.start);
    return start < eventStart + event.duration && end > eventStart;
  });
  if (conflicts) {
    return { error: 'That time is no longer free. Choose another slot.' };
  }

  const startsAt = new Date(`${day}T${slot}:00.000Z`);
  try {
    await prisma.booking.create({
      data: {
        bookingPageId: bookingPage.id,
        guestName: guestName.trim() || 'Guest',
        startsAt,
      },
    });
  } catch {
    return { error: 'That time was just booked. Choose another slot.' };
  }

  return { data: { slot, startsAt } };
}

export async function updateBookingAvailability(input: AvailabilityInput) {
  const title = input.title.trim();
  if (!title) return { error: 'Give your booking page a title.' };
  if (!timePattern.test(input.startTime) || !timePattern.test(input.endTime)) {
    return { error: 'Choose a valid time window.' };
  }

  const start = timeToMinutes(input.startTime);
  const end = timeToMinutes(input.endTime);
  if (end <= start) return { error: 'End time must be after start time.' };
  if (![15, 30, 45, 60].includes(input.duration)) {
    return { error: 'Choose a valid meeting length.' };
  }

  const user = await getCurrentUser();
  if (!user) return { error: 'Your local profile is unavailable.' };

  const page = await prisma.bookingPage.upsert({
    create: {
      active: input.active,
      duration: input.duration,
      endTime: input.endTime,
      handle: user.handle,
      startTime: input.startTime,
      title,
      userId: user.id,
    },
    update: {
      active: input.active,
      duration: input.duration,
      endTime: input.endTime,
      startTime: input.startTime,
      title,
    },
    where: { handle: user.handle },
  });

  return { data: page };
}
