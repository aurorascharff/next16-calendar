export type CalendarName = 'focus' | 'personal' | 'team'
export type EventColor = 'amber' | 'blue' | 'rose' | 'violet'
export type CalendarView = 'day' | 'week'

export type CalendarEvent = {
  calendar: CalendarName
  color: EventColor
  day: string
  duration: number
  id: string
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
