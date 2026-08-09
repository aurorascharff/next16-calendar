import { getCalendars, getCalendarWeek } from '../calendar-queries'
import type { CalendarView } from '../types/calendar'
import { CalendarBoard, CalendarBoardSkeleton } from './calendar-board'

export async function CalendarWeek({ date, view }: { date: string; view: CalendarView }) {
  const [week, calendars] = await Promise.all([getCalendarWeek(date), getCalendars()])
  const days = view === 'day' ? [date] : week.days

  return (
    <section className="min-h-0 flex-1 overflow-auto">
      <CalendarBoard calendars={calendars} days={days} events={week.events} view={view} />
    </section>
  )
}

export function CalendarWeekSkeleton({ view = 'week' }: { view?: CalendarView }) {
  return (
    <section className="min-h-0 flex-1 overflow-auto">
      <CalendarBoardSkeleton days={view === 'day' ? 1 : 7} />
    </section>
  )
}
