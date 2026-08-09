import { getCalendarWeek } from '../calendar-queries'
import { CalendarBoard, CalendarBoardSkeleton } from './calendar-board'

export async function CalendarWeek({ date }: { date: string }) {
  const week = await getCalendarWeek(date)

  return (
    <section className="min-h-0 flex-1 overflow-auto">
      <CalendarBoard week={week} />
    </section>
  )
}

export function CalendarWeekSkeleton() {
  return (
    <section className="min-h-0 flex-1 overflow-auto">
      <CalendarBoardSkeleton />
    </section>
  )
}
