'use server';

import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { dateKey, getWeekDays, isDateKey, timeToMinutes } from '@/features/calendar/calendar-utils';
import { verifyAuth } from '@/features/user/user-queries';
import { prisma } from '@/lib/db';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

type AvailabilityInput = {
  active: boolean;
  calendarId: string;
  duration: number;
  endTime: string;
  startTime: string;
  title: string;
};

export type BookSlotState = {
  error?: string;
} | null;

function occursOn(event: { day: Date; recurrence: string | null }, day: string) {
  if (!event.recurrence) return dateKey(event.day) === day;
  const weekday = new Date(`${day}T00:00:00.000Z`).getUTCDay();
  if (event.recurrence === 'weekday') return weekday >= 1 && weekday <= 5;
  return event.recurrence === WEEKDAY_NAMES[weekday];
}

export async function bookSlotAction(_state: BookSlotState, formData: FormData): Promise<BookSlotState> {
  const day = String(formData.get('day') ?? '');
  const handle = String(formData.get('handle') ?? '');
  const result = await bookSlot({
    day,
    guestEmail: String(formData.get('guestEmail') ?? ''),
    guestName: String(formData.get('guestName') ?? ''),
    handle,
    slot: String(formData.get('slot') ?? ''),
    title: String(formData.get('title') ?? ''),
  });

  if ('error' in result) return { error: result.error };

  redirect(`/book/${handle}?date=${day}&booked=${encodeURIComponent(result.data.slot)}`);
}

export async function bookSlot({
  day,
  guestEmail,
  guestName,
  handle,
  slot,
  title,
}: {
  day: string;
  guestEmail: string;
  guestName: string;
  handle: string;
  slot: string;
  title: string;
}) {
  if (!isDateKey(day) || !timePattern.test(slot)) {
    return { error: 'Choose a valid booking time.' };
  }
  const name = guestName.trim();
  if (!name) return { error: 'Enter your name to book this time.' };
  const email = guestEmail.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: 'Enter a valid email address.' };
  const meetingTitle = title.trim();
  if (!meetingTitle) return { error: 'Enter a meeting title.' };

  const bookingPage = await prisma.bookingPage.findUnique({
    include: { user: { select: { name: true } } },
    where: { handle },
  });
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
    await prisma.$transaction(async tx => {
      const calendar = bookingPage.calendarId
        ? await tx.calendar.findFirst({
            where: { id: bookingPage.calendarId, isDemo: false, userId: bookingPage.userId },
          })
        : await tx.calendar.findFirst({
            orderBy: { createdAt: 'desc' },
            where: { isDemo: false, userId: bookingPage.userId },
          });

      if (!calendar) {
        throw new Error('calendar-not-enabled');
      }

      await tx.booking.create({
        data: {
          bookingPageId: bookingPage.id,
          guestEmail: email,
          guestName: name,
          startsAt,
          title: meetingTitle,
        },
      });

      await tx.calendarEvent.create({
        data: {
          calendarId: calendar.id,
          description: `${bookingPage.user.name} and ${name} (${email})`,
          day: new Date(`${day}T00:00:00.000Z`),
          duration: bookingPage.duration,
          start: slot,
          title: meetingTitle,
          userId: bookingPage.userId,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'calendar-not-enabled') {
      return { error: 'This booking link is not accepting meetings yet.' };
    }

    return { error: 'That time was just booked. Choose another slot.' };
  }

  updateTag(`booking:${handle}`);
  updateTag('calendars');
  updateTag('calendar-events');
  updateTag(`calendar-week:${getWeekDays(day)[0]}`);
  return { data: { slot, startsAt } };
}

export async function updateBookingAvailability(input: AvailabilityInput) {
  const title = input.title.trim();
  const calendarId = input.calendarId.trim();
  if (!title) return { error: 'Give your booking page a title.' };
  if (!calendarId) return { error: 'Choose a calendar for bookings.' };
  if (!timePattern.test(input.startTime) || !timePattern.test(input.endTime)) {
    return { error: 'Choose a valid time window.' };
  }

  const start = timeToMinutes(input.startTime);
  const end = timeToMinutes(input.endTime);
  if (end <= start) return { error: 'End time must be after start time.' };
  if (![15, 30, 45, 60].includes(input.duration)) {
    return { error: 'Choose a valid meeting length.' };
  }

  const user = await verifyAuth();
  const calendar = await prisma.calendar.findFirst({
    select: { id: true },
    where: { id: calendarId, isDemo: false, userId: user.id },
  });
  if (!calendar) return { error: 'Choose one of your calendars for bookings.' };

  const page = await prisma.bookingPage.upsert({
    create: {
      active: input.active,
      calendarId: calendar.id,
      duration: input.duration,
      endTime: input.endTime,
      handle: user.handle,
      startTime: input.startTime,
      title,
      userId: user.id,
    },
    update: {
      active: input.active,
      calendarId: calendar.id,
      duration: input.duration,
      endTime: input.endTime,
      startTime: input.startTime,
      title,
    },
    where: { handle: user.handle },
  });

  updateTag(`booking:${user.handle}`);
  return { data: page };
}
