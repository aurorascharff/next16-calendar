'use server'

import { updateTag } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/features/user/user-queries'
import { isCalendarColor } from './utils/colors'
import { calendarCache } from './calendar-queries'
import { getWeekDays, isDateKey } from './calendar-utils'

type MoveEventInput = {
  day: string
  sourceId: string
  start: string
}

type CreateEventInput = {
  allDay?: boolean
  calendarId: string
  day: string
  duration: number
  recurrence?: string | null
  start: string
  title: string
}

type UpdateEventInput = {
  allDay?: boolean
  duration: number
  eventId: string
  start: string
  title: string
}

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/
const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const RECURRENCE_VALUES = new Set(['weekday', ...WEEKDAY_NAMES])

async function requireUserId() {
  const user = await getCurrentUser()
  return user?.id ?? null
}

async function findEvent(id: string) {
  return prisma.calendarEvent.findUnique({ where: { id } })
}

function invalidateWeek(day: Date | string) {
  const key = typeof day === 'string' ? day : day.toISOString().slice(0, 10)
  updateTag(calendarCache.tag)
  updateTag(calendarCache.weekTag(getWeekDays(key)[0]))
}

export async function moveEvent({ day, sourceId, start }: MoveEventInput) {
  const event = await findEvent(sourceId)
  if (!event) return { error: 'This event no longer exists.' }
  if (event.demo) return { error: 'Create your own calendar to make changes.' }
  if (!event.allDay && !timePattern.test(start)) return { error: 'Choose a valid time.' }

  const eventStart = event.allDay ? '00:00' : start

  if (event.recurrence) {
    const data: { recurrence?: string; start: string } = { start: eventStart }
    if (event.recurrence !== 'weekday' && isDateKey(day)) {
      data.recurrence = WEEKDAY_NAMES[new Date(`${day}T00:00:00.000Z`).getUTCDay()]
    }
    const updated = await prisma.calendarEvent.update({ data, where: { id: sourceId } })
    invalidateWeek(event.day)
    return { data: updated }
  }

  if (!isDateKey(day)) return { error: 'Choose a valid date.' }

  const previousDay = event.day
  const updated = await prisma.calendarEvent.update({
    data: { day: new Date(`${day}T00:00:00.000Z`), start: eventStart },
    where: { id: sourceId },
  })
  invalidateWeek(previousDay)
  invalidateWeek(day)
  return { data: updated }
}

export async function createEvent(input: CreateEventInput) {
  const title = input.title.trim()
  const allDay = Boolean(input.allDay)
  if (!title) return { error: 'Add a title before saving the event.' }
  if (!isDateKey(input.day) || (!allDay && !timePattern.test(input.start))) {
    return { error: 'Choose a valid date and time.' }
  }

  const userId = await requireUserId()
  if (!userId) return { error: 'Your local profile is unavailable. Run the database seed first.' }

  const calendar = await prisma.calendar.findFirst({ where: { id: input.calendarId, userId } })
  if (!calendar) return { error: 'Choose a calendar for this event.' }
  if (calendar.isDemo) return { error: 'Create your own calendar to make changes.' }

  const recurrence = input.recurrence && RECURRENCE_VALUES.has(input.recurrence) ? input.recurrence : null

  const event = await prisma.calendarEvent.create({
    data: {
      calendarId: input.calendarId,
      allDay,
      day: new Date(`${input.day}T00:00:00.000Z`),
      duration: allDay ? 24 * 60 : input.duration,
      recurrence,
      start: allDay ? '00:00' : input.start,
      title,
      userId,
    },
  })
  invalidateWeek(input.day)
  return { data: event }
}

export async function updateEvent(input: UpdateEventInput) {
  const title = input.title.trim()
  const allDay = Boolean(input.allDay)
  if (!title || (!allDay && !timePattern.test(input.start))) {
    return { error: 'Add a title and a valid start time.' }
  }

  const event = await findEvent(input.eventId)
  if (!event) return { error: 'This event no longer exists.' }
  if (event.demo) return { error: 'Create your own calendar to make changes.' }

  const updated = await prisma.calendarEvent.update({
    data: {
      allDay,
      duration: allDay ? 24 * 60 : input.duration,
      start: allDay ? '00:00' : input.start,
      title,
    },
    where: { id: input.eventId },
  })
  invalidateWeek(event.day)
  return { data: updated }
}

export async function resizeEvent({ duration, sourceId }: { duration: number; sourceId: string }) {
  if (duration < 15 || duration > 24 * 60) return { error: 'Choose a valid duration.' }

  const event = await findEvent(sourceId)
  if (!event) return { error: 'This event no longer exists.' }
  if (event.demo) return { error: 'Create your own calendar to make changes.' }
  if (event.allDay) return { error: 'All-day events do not resize.' }

  const updated = await prisma.calendarEvent.update({ data: { duration }, where: { id: sourceId } })
  invalidateWeek(event.day)
  return { data: updated }
}

export async function deleteEvent(eventId: string) {
  const event = await findEvent(eventId)
  if (!event) return { error: 'This event no longer exists.' }
  if (event.demo) return { error: 'Create your own calendar to make changes.' }

  await prisma.calendarEvent.delete({ where: { id: eventId } })
  invalidateWeek(event.day)
  return { data: { id: eventId } }
}

export async function createCalendar({ color, name }: { color: string; name: string }) {
  const trimmed = name.trim()
  if (!trimmed) return { error: 'Give the calendar a name.' }
  if (!isCalendarColor(color)) return { error: 'Choose a color.' }

  const userId = await requireUserId()
  if (!userId) return { error: 'Your local profile is unavailable.' }

  const calendar = await prisma.calendar.create({ data: { color, name: trimmed, userId } })
  updateTag(calendarCache.calendarsTag)
  return { data: calendar }
}

export async function updateCalendar({ color, id, name }: { color: string; id: string; name: string }) {
  const trimmed = name.trim()
  if (!trimmed) return { error: 'Give the calendar a name.' }
  if (!isCalendarColor(color)) return { error: 'Choose a color.' }

  const calendar = await prisma.calendar.findUnique({ where: { id } })
  if (!calendar) return { error: 'This calendar no longer exists.' }
  if (calendar.isDemo) return { error: 'Demo calendars can’t be changed.' }

  const updated = await prisma.calendar.update({ data: { color, name: trimmed }, where: { id } })
  updateTag(calendarCache.calendarsTag)
  updateTag(calendarCache.tag)
  return { data: updated }
}

export async function deleteCalendar(id: string) {
  const calendar = await prisma.calendar.findUnique({ where: { id } })
  if (!calendar) return { error: 'This calendar no longer exists.' }
  if (calendar.isDemo) return { error: 'Demo calendars can’t be deleted.' }

  await prisma.calendar.delete({ where: { id } })
  updateTag(calendarCache.calendarsTag)
  updateTag(calendarCache.tag)
  return { data: { id } }
}
