export type CalendarEvent = {
  calendar: 'personal' | 'team' | 'focus'
  color: 'blue' | 'violet' | 'amber' | 'rose'
  day: string
  duration: number
  id: string
  note?: string
  start: string
  title: string
}

export type CalendarWeek = {
  days: string[]
  events: CalendarEvent[]
  start: string
}
