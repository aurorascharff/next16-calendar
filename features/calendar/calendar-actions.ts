'use server'

import { updateTag } from 'next/cache'
import { prisma } from '@/lib/db'
import { calendarCache } from './calendar-queries'
import { getWeekDays, isDateKey } from './calendar-utils'

type MoveEventInput = {
  day: string
  sourceId: string
  start: string
}

type CreateEventInput = {
  calendar: 'focus' | 'personal' | 'team'
  color: 'amber' | 'blue' | 'rose' | 'violet'
  day: string
  duration: number
  recurrence?: string | null
  start: string
  title: string
}

type UpdateEventInput = Pick<CreateEventInput, 'color' | 'duration' | 'start' | 'title'> & {
  eventId: string
}

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/
const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const RECURRENCE_VALUES = new Set(['weekday', ...WEEKDAY_NAMES])

export async function moveEvent({ day, sourceId, start }: MoveEventInput) {
  if (!timePattern.test(start)) {
    return { error: 'Choose a valid time.' }
  }

  const event = await prisma.calendarEvent.findUnique({ where: { id: sourceId } })
  if (!event) return { error: 'This event no longer exists.' }

  if (event.recurrence) {
    const data: { recurrence?: string; start: string } = { start }
    if (event.recurrence !== 'weekday' && isDateKey(day)) {
      data.recurrence = WEEKDAY_NAMES[new Date(`${day}T00:00:00.000Z`).getUTCDay()]
    }
    const updated = await prisma.calendarEvent.update({ data, where: { id: sourceId } })
    updateTag(calendarCache.tag)
    updateTag(calendarCache.weekTag(getWeekDays(event.day.toISOString().slice(0, 10))[0]))
    return { data: updated }
  }

  if (!isDateKey(day)) return { error: 'Choose a valid date.' }

  const previousDay = event.day
  const updated = await prisma.calendarEvent.update({
    data: { day: new Date(`${day}T00:00:00.000Z`), start },
    where: { id: sourceId },
  })

  updateTag(calendarCache.tag)
  updateTag(calendarCache.weekTag(getWeekDays(previousDay.toISOString().slice(0, 10))[0]))
  updateTag(calendarCache.weekTag(getWeekDays(day)[0]))

  return { data: updated }
}

export async function createEvent(input: CreateEventInput) {
  const title = input.title.trim()
  if (!title) return { error: 'Add a title before saving the event.' }
  if (!isDateKey(input.day) || !timePattern.test(input.start)) {
    return { error: 'Choose a valid date and time.' }
  }

  const user = await prisma.user.findUnique({
    select: { id: true },
    where: { handle: 'aurora' },
  })
  if (!user) return { error: 'Your local profile is unavailable. Run the database seed first.' }

  const recurrence = input.recurrence && RECURRENCE_VALUES.has(input.recurrence) ? input.recurrence : null

  const event = await prisma.calendarEvent.create({
    data: {
      calendar: input.calendar,
      color: input.color,
      day: new Date(`${input.day}T00:00:00.000Z`),
      duration: input.duration,
      recurrence,
      start: input.start,
      title,
      userId: user.id,
    },
  })

  updateTag(calendarCache.tag)
  updateTag(calendarCache.weekTag(getWeekDays(input.day)[0]))
  return { data: event }
}

export async function updateEvent(input: UpdateEventInput) {
  const title = input.title.trim()
  if (!title || !timePattern.test(input.start)) {
    return { error: 'Add a title and a valid start time.' }
  }

  const event = await prisma.calendarEvent.findUnique({ where: { id: input.eventId } })
  if (!event) return { error: 'This event no longer exists.' }

  const updated = await prisma.calendarEvent.update({
    data: {
      color: input.color,
      duration: input.duration,
      start: input.start,
      title,
    },
    where: { id: input.eventId },
  })

  updateTag(calendarCache.tag)
  updateTag(calendarCache.weekTag(getWeekDays(event.day.toISOString().slice(0, 10))[0]))
  return { data: updated }
}

export async function resizeEvent({ duration, sourceId }: { duration: number; sourceId: string }) {
  if (duration < 15 || duration > 24 * 60) return { error: 'Choose a valid duration.' }

  const event = await prisma.calendarEvent.findUnique({ where: { id: sourceId } })
  if (!event) return { error: 'This event no longer exists.' }

  const updated = await prisma.calendarEvent.update({ data: { duration }, where: { id: sourceId } })
  updateTag(calendarCache.tag)
  updateTag(calendarCache.weekTag(getWeekDays(event.day.toISOString().slice(0, 10))[0]))
  return { data: updated }
}

export async function deleteEvent(eventId: string) {
  const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } })
  if (!event) return { error: 'This event no longer exists.' }

  await prisma.calendarEvent.delete({ where: { id: eventId } })
  updateTag(calendarCache.tag)
  updateTag(calendarCache.weekTag(getWeekDays(event.day.toISOString().slice(0, 10))[0]))
  return { data: { id: eventId } }
}

export async function bookSlot({
  day,
  guestName,
  handle,
  slot,
}: {
  day: string
  guestName: string
  handle: string
  slot: string
}) {
  if (!isDateKey(day) || !timePattern.test(slot)) {
    return { error: 'Choose a valid booking time.' }
  }

  const bookingPage = await prisma.bookingPage.findUnique({ where: { handle } })
  if (!bookingPage || !bookingPage.active) {
    return { error: 'This booking page is not available.' }
  }

  const startsAt = new Date(`${day}T${slot}:00.000Z`)
  try {
    await prisma.booking.create({
      data: {
        bookingPageId: bookingPage.id,
        guestName: guestName.trim() || 'Guest',
        startsAt,
      },
    })
  } catch {
    return { error: 'That time was just booked. Choose another slot.' }
  }

  return { data: { slot, startsAt } }
}
