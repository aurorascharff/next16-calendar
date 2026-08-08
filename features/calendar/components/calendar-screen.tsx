import Link from 'next/link'
import { Link2 } from 'lucide-react'
import { ViewTransition } from 'react'
import { CalendarBoard, CalendarBoardSkeleton } from './calendar-board'
import { CalendarControls } from './calendar-controls'
import { NewEventButton } from './new-event-button'
import { getCalendarWeek } from '../calendar-queries'
import { formatMonth } from '../calendar-utils'

export async function CalendarScreen({ date }: { date: string }) {
  const week = await getCalendarWeek(date)
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex min-h-18 items-center justify-between border-b border-divider px-4 sm:px-6 dark:border-divider-dark">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <div>
              <p className="text-muted text-xs font-medium">Calendar</p>
              <h1 className="mt-0.5 truncate text-lg font-semibold">{formatMonth(week.start)}</h1>
            </div>
            <div className="hidden sm:block">
              <CalendarControls date={date} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              className="hidden items-center gap-2 rounded-md border border-divider px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-card hover:text-black sm:flex dark:border-divider-dark dark:hover:bg-card-dark dark:hover:text-white"
              href="/booking"
            >
              <Link2 className="size-4" />
              Booking links
            </Link>
            <NewEventButton day={date} />
          </div>
      </header>
      <div className="border-b border-divider px-4 py-2 dark:border-divider-dark sm:hidden">
        <CalendarControls date={date} />
      </div>
      <ViewTransition default="none" enter="calendar-forward" exit="calendar-back">
        <section className="min-h-0 flex-1 overflow-auto">
          <CalendarBoard week={week} />
        </section>
      </ViewTransition>
    </main>
  )
}

export function CalendarScreenSkeleton() {
  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <div className="min-h-18 border-b border-divider dark:border-divider-dark" />
      <CalendarBoardSkeleton />
    </main>
  )
}
