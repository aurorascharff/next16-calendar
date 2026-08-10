'use server';

import { updateTag } from 'next/cache';
import { bookingCache } from '@/features/booking/booking-queries';
import { verifyAuth } from '@/features/user/user-queries';
import { prisma } from '@/lib/db';
import { calendarCache } from './calendar-queries';
import { getWeekDays, isDateKey } from './calendar-utils';
import { isCalendarColor } from './utils/colors';
import type { EventAction, EventMutationState } from './utils/event-optimistic-reducer';

type MoveEventInput = {
  day: string;
  sourceId: string;
  start: string;
};

type CreateEventInput = {
  allDay?: boolean;
  calendarId?: string;
  day: string;
  description?: string;
  duration: number;
  recurrence?: string | null;
  start: string;
  title: string;
};

type UpdateEventInput = {
  allDay?: boolean;
  description?: string;
  duration: number;
  eventId: string;
  start: string;
  title: string;
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const RECURRENCE_VALUES = new Set(['weekday', ...WEEKDAY_NAMES]);

async function requireUser() {
  return verifyAuth();
}

async function findEvent(id: string) {
  return prisma.calendarEvent.findUnique({ where: { id } });
}

function invalidateWeek(day: Date | string, handle: string) {
  const key = typeof day === 'string' ? day : day.toISOString().slice(0, 10);
  updateTag(calendarCache.tag);
  updateTag(calendarCache.weekTag(getWeekDays(key)[0]));
  updateTag(bookingCache.tag(handle));
}

function invalidateCalendars(handle: string) {
  updateTag(calendarCache.calendarsTag);
  updateTag(calendarCache.tag);
  updateTag(bookingCache.tag(handle));
}

function validTimedDuration(duration: number) {
  return duration >= 15 && duration <= 24 * 60;
}

export async function moveEvent({ day, sourceId, start }: MoveEventInput) {
  const user = await requireUser();
  const event = await findEvent(sourceId);
  if (!event) return { error: 'This event no longer exists.' };
  if (event.demo) return { error: 'Create your own calendar to make changes.' };
  if (event.userId !== user.id) return { error: 'This event is not available.' };
  if (!event.allDay && !timePattern.test(start)) return { error: 'Choose a valid time.' };

  const eventStart = event.allDay ? '00:00' : start;

  if (event.recurrence) {
    const data: { recurrence?: string; start: string } = { start: eventStart };
    if (event.recurrence !== 'weekday' && isDateKey(day)) {
      data.recurrence = WEEKDAY_NAMES[new Date(`${day}T00:00:00.000Z`).getUTCDay()];
    }
    const updated = await prisma.calendarEvent.update({ data, where: { id: sourceId } });
    invalidateWeek(event.day, user.handle);
    return { data: updated };
  }

  if (!isDateKey(day)) return { error: 'Choose a valid date.' };

  const previousDay = event.day;
  const updated = await prisma.calendarEvent.update({
    data: { day: new Date(`${day}T00:00:00.000Z`), start: eventStart },
    where: { id: sourceId },
  });
  invalidateWeek(previousDay, user.handle);
  invalidateWeek(day, user.handle);
  return { data: updated };
}

export async function createEvent(input: CreateEventInput) {
  const title = input.title.trim();
  const allDay = Boolean(input.allDay);
  if (!title) return { error: 'Add a title before saving the event.' };
  if (!isDateKey(input.day) || (!allDay && !timePattern.test(input.start))) {
    return { error: 'Choose a valid date and time.' };
  }
  if (!allDay && !validTimedDuration(input.duration)) return { error: 'Choose a valid duration.' };

  const user = await requireUser();

  const calendar = input.calendarId
    ? await prisma.calendar.findUnique({ where: { id: input.calendarId } })
    : await prisma.calendar.findFirst({
        orderBy: { createdAt: 'desc' },
        where: { isDemo: false, userId: user.id },
      });

  if (!calendar) return { error: 'Create a calendar before adding events.' };
  if (calendar.isDemo) return { error: 'Create your own calendar to make changes.' };
  if (calendar.userId !== user.id) return { error: 'Choose a calendar for this event.' };

  const recurrence = input.recurrence && RECURRENCE_VALUES.has(input.recurrence) ? input.recurrence : null;
  const description = input.description?.trim() || null;

  const event = await prisma.calendarEvent.create({
    data: {
      calendarId: calendar.id,
      allDay,
      day: new Date(`${input.day}T00:00:00.000Z`),
      description,
      duration: allDay ? 24 * 60 : input.duration,
      recurrence,
      start: allDay ? '00:00' : input.start,
      title,
      userId: user.id,
    },
  });
  invalidateWeek(input.day, user.handle);
  return { data: event };
}

export async function updateEvent(input: UpdateEventInput) {
  const title = input.title.trim();
  const allDay = Boolean(input.allDay);
  if (!title || (!allDay && !timePattern.test(input.start))) {
    return { error: 'Add a title and a valid start time.' };
  }
  if (!allDay && !validTimedDuration(input.duration)) return { error: 'Choose a valid duration.' };

  const user = await requireUser();
  const event = await findEvent(input.eventId);
  if (!event) return { error: 'This event no longer exists.' };
  if (event.demo) return { error: 'Create your own calendar to make changes.' };
  if (event.userId !== user.id) return { error: 'This event is not available.' };

  const updated = await prisma.calendarEvent.update({
    data: {
      allDay,
      description: input.description?.trim() || null,
      duration: allDay ? 24 * 60 : input.duration,
      start: allDay ? '00:00' : input.start,
      title,
    },
    where: { id: input.eventId },
  });
  invalidateWeek(event.day, user.handle);
  return { data: updated };
}

export async function resizeEvent({ duration, sourceId }: { duration: number; sourceId: string }) {
  if (!validTimedDuration(duration)) return { error: 'Choose a valid duration.' };

  const user = await requireUser();
  const event = await findEvent(sourceId);
  if (!event) return { error: 'This event no longer exists.' };
  if (event.demo) return { error: 'Create your own calendar to make changes.' };
  if (event.userId !== user.id) return { error: 'This event is not available.' };
  if (event.allDay) return { error: 'All-day events do not resize.' };

  const updated = await prisma.calendarEvent.update({ data: { duration }, where: { id: sourceId } });
  invalidateWeek(event.day, user.handle);
  return { data: updated };
}

export async function deleteEvent(eventId: string) {
  const user = await requireUser();
  const event = await findEvent(eventId);
  if (!event) return { error: 'This event no longer exists.' };
  if (event.demo) return { error: 'Create your own calendar to make changes.' };
  if (event.userId !== user.id) return { error: 'This event is not available.' };

  await prisma.calendarEvent.delete({ where: { id: eventId } });
  invalidateWeek(event.day, user.handle);
  return { data: { id: eventId } };
}

export async function calendarEventsReducer(
  _state: EventMutationState,
  action: EventAction,
): Promise<EventMutationState> {
  const result = await saveEventAction(action);
  if (result.error) {
    return {
      actions: [],
      notification: { message: result.error, type: 'error' },
    };
  }

  const message = action.type === 'delete' ? 'Event removed.' : action.type === 'update' ? 'Event updated.' : null;
  return {
    actions: [],
    notification: message ? { message, type: 'success' } : null,
  };
}

function saveEventAction(action: EventAction) {
  switch (action.type) {
    case 'create':
      return createEvent({
        allDay: action.event.allDay,
        calendarId: action.event.calendarId || undefined,
        day: action.event.day,
        description: action.event.description ?? undefined,
        duration: action.event.duration,
        recurrence: action.event.recurrence,
        start: action.event.start,
        title: action.event.title,
      });
    case 'delete':
      return deleteEvent(action.sourceId);
    case 'move':
      return moveEvent({ day: action.day, sourceId: action.sourceId, start: action.start });
    case 'resize':
      return resizeEvent({ duration: action.duration, sourceId: action.sourceId });
    case 'update':
      return updateEvent({
        allDay: action.event.allDay,
        description: action.event.description ?? undefined,
        duration: action.event.duration,
        eventId: action.event.sourceId,
        start: action.event.start,
        title: action.event.title,
      });
  }
}

export async function createCalendar({ color, name }: { color: string; name: string }) {
  const trimmed = name.trim();
  if (!trimmed) return { error: 'Give the calendar a name.' };
  if (!isCalendarColor(color)) return { error: 'Choose a color.' };

  const user = await requireUser();

  const calendar = await prisma.calendar.create({ data: { color, name: trimmed, userId: user.id } });
  invalidateCalendars(user.handle);
  return { data: calendar };
}

export async function updateCalendar({ color, id, name }: { color: string; id: string; name: string }) {
  const trimmed = name.trim();
  if (!trimmed) return { error: 'Give the calendar a name.' };
  if (!isCalendarColor(color)) return { error: 'Choose a color.' };

  const user = await requireUser();
  const calendar = await prisma.calendar.findUnique({ where: { id } });
  if (!calendar) return { error: 'This calendar no longer exists.' };
  if (calendar.isDemo) return { error: 'Create your own calendar to make changes.' };
  if (calendar.userId !== user.id) return { error: 'This calendar is not available.' };

  const updated = await prisma.calendar.update({ data: { color, name: trimmed }, where: { id } });
  invalidateCalendars(user.handle);
  return { data: updated };
}

export async function deleteCalendar(id: string) {
  const user = await requireUser();
  const calendar = await prisma.calendar.findUnique({ where: { id } });
  if (!calendar) return { error: 'This calendar no longer exists.' };
  if (calendar.isDemo) return { error: 'Create your own calendar to make changes.' };
  if (calendar.userId !== user.id) return { error: 'This calendar is not available.' };

  await prisma.calendar.delete({ where: { id } });
  invalidateCalendars(user.handle);
  return { data: { id } };
}
