import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { notFound } from 'next/navigation'
import { events } from './calendar-data'
import type { CalendarWeek } from './calendar-types'
import { getWeekDays } from './calendar-utils'

export const calendarCache = {
  tag: 'calendar-events',
  weekTag: (start: string) => `calendar-week:${start}`,
}

export async function getCalendarWeek(date: string): Promise<CalendarWeek> {
  'use cache'
  const days = getWeekDays(date)
  const start = days[0]

  cacheLife('hours')
  cacheTag(calendarCache.tag, calendarCache.weekTag(start))

  return {
    days,
    events: events.filter((event) => days.includes(event.day)),
    start,
  }
}

export async function getBookingProfile(handle: string) {
  'use cache'
  cacheLife('hours')
  cacheTag(`booking:${handle}`)

  if (handle !== 'aurora') notFound()

  return {
    handle,
    name: 'Aurora Scharff',
    slots: ['09:30', '11:00', '13:30', '15:00'],
    title: 'A focused 30 minute conversation',
  }
}
