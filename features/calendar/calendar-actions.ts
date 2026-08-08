'use server'

import { updateTag } from 'next/cache'
import { events } from './calendar-data'
import { calendarCache } from './calendar-queries'
import { getWeekDays } from './calendar-utils'

type MoveEventInput = {
  day: string
  eventId: string
  start: string
}

type CreateEventInput = {
  day: string
  start: string
  title: string
}

export async function moveEvent({ day, eventId, start }: MoveEventInput) {
  const event = events.find((candidate) => candidate.id === eventId)
  if (!event) return { error: 'Event not found.' }

  const previousDay = event.day
  event.day = day
  event.start = start

  updateTag(calendarCache.tag)
  updateTag(calendarCache.weekTag(getWeekDays(previousDay)[0]))
  updateTag(calendarCache.weekTag(getWeekDays(day)[0]))

  return { data: event }
}

export async function createEvent({ day, start, title }: CreateEventInput) {
  const trimmedTitle = title.trim()
  if (!trimmedTitle) return { error: 'Add a title before saving the event.' }

  const event = {
    calendar: 'personal' as const,
    color: 'blue' as const,
    day,
    duration: 60,
    id: `event-${crypto.randomUUID()}`,
    start,
    title: trimmedTitle,
  }

  events.push(event)
  updateTag(calendarCache.tag)
  updateTag(calendarCache.weekTag(getWeekDays(day)[0]))

  return { data: event }
}

export async function bookSlot({ handle, slot }: { handle: string; slot: string }) {
  if (handle !== 'aurora') return { error: 'This booking page is not available.' }
  return { data: { slot } }
}
