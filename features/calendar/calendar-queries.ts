import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { delay } from '@/lib/utils'
import type { Calendar, CalendarColor, CalendarEvent, CalendarWeek } from './types/calendar'
import { dateKey, getWeekDays, isDateKey } from './calendar-utils'

export const calendarCache = {
  calendarsTag: 'calendars',
  tag: 'calendar-events',
  weekTag: (start: string) => `calendar-week:${start}`,
}

type StoredEvent = {
  calendar: { color: string }
  calendarId: string
  day: Date
  demo: boolean
  duration: number
  id: string
  recurrence: string | null
  start: string
  title: string
}

async function getCurrentUserId() {
  'use cache'
  cacheLife('hours')
  const user = await prisma.user.findUnique({
    select: { id: true },
    where: { handle: 'aurora' },
  })
  return user?.id ?? null
}

export async function getCalendars(): Promise<Calendar[]> {
  const userId = await getCurrentUserId()
  if (!userId) return []
  return getCalendarsForUser(userId)
}

async function getCalendarsForUser(userId: string): Promise<Calendar[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(calendarCache.calendarsTag)

  const rows = await prisma.calendar.findMany({
    orderBy: [{ isDemo: 'desc' }, { createdAt: 'asc' }],
    where: { userId },
  })

  return rows.map((calendar) => ({
    color: calendar.color as CalendarColor,
    id: calendar.id,
    isDemo: calendar.isDemo,
    name: calendar.name,
  }))
}

export async function getCalendarWeek(date: string): Promise<CalendarWeek> {
  if (!isDateKey(date)) notFound()

  const userId = await getCurrentUserId()
  if (!userId) notFound()
  return getCalendarWeekForUser(date, userId)
}

async function getCalendarWeekForUser(
  date: string,
  userId: string,
): Promise<CalendarWeek> {
  'use cache'
  const days = getWeekDays(date)
  const start = days[0]

  cacheLife('hours')
  cacheTag(calendarCache.tag, calendarCache.weekTag(start))

  await delay(650)
  const rows = await prisma.calendarEvent.findMany({
    include: { calendar: { select: { color: true } } },
    orderBy: [{ start: 'asc' }, { title: 'asc' }],
    where: { userId },
  })

  return {
    days,
    events: rows.flatMap((event) => expandEvent(event, days)),
    start,
  }
}

function expandEvent(event: StoredEvent, days: string[]): CalendarEvent[] {
  if (!event.recurrence) {
    const day = dateKey(event.day)
    return days.includes(day) ? [toCalendarEvent(event, day)] : []
  }

  const recurrence = event.recurrence

  return days.flatMap((day) =>
    matchesRecurrence(recurrence, day)
      ? [
          {
            ...toCalendarEvent(event, day),
            id: `${event.id}:${day}`,
            recurring: true,
          },
        ]
      : [],
  )
}

function matchesRecurrence(recurrence: string, day: string) {
  const weekday = new Date(`${day}T00:00:00.000Z`).getUTCDay()
  return (
    recurrence === 'weekday'
      ? weekday >= 1 && weekday <= 5
      : recurrence === ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][weekday]
  )
}

function toCalendarEvent(event: StoredEvent, day: string): CalendarEvent {
  return {
    calendarId: event.calendarId,
    color: event.calendar.color as CalendarColor,
    day,
    duration: event.duration,
    id: event.id,
    isDemo: event.demo,
    recurrence: event.recurrence,
    sourceId: event.id,
    start: event.start,
    title: event.title,
  }
}

