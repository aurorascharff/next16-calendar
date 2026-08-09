export type CalendarView = 'day' | 'week'
export type CalendarColor = 'indigo' | 'blue' | 'sky' | 'teal' | 'violet' | 'rose'

export type Calendar = {
  color: CalendarColor
  id: string
  isDemo: boolean
  name: string
}

export type CalendarEvent = {
  calendarId: string
  color: CalendarColor
  day: string
  duration: number
  id: string
  isDemo: boolean
  recurrence?: string | null
  recurring?: boolean
  sourceId: string
  start: string
  title: string
}

export type CalendarWeek = {
  days: string[]
  events: CalendarEvent[]
  start: string
}
