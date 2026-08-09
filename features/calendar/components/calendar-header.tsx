import { CalendarControls } from './calendar-controls'
import { NewEventButton } from './new-event-button'
import type { CalendarView } from '../types/calendar'
import { formatDayLong, formatMonth } from '../calendar-utils'

export function CalendarHeader({ date, view }: { date: string; view: CalendarView }) {
  return (
    <>
      <header className="flex min-h-18 items-center justify-between border-b border-divider px-4 sm:px-6 dark:border-divider-dark">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <h1 className="shrink-0 truncate text-lg font-semibold tracking-tight sm:w-52">
            {view === 'day' ? formatDayLong(date) : formatMonth(date)}
          </h1>
          <div className="hidden sm:block">
            <CalendarControls date={date} view={view} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <NewEventButton day={date} />
        </div>
      </header>
      <div className="border-b border-divider px-4 py-2 dark:border-divider-dark sm:hidden">
        <CalendarControls date={date} view={view} />
      </div>
    </>
  )
}

export function CalendarHeaderSkeleton() {
  return (
    <>
      <div className="min-h-18 border-b border-divider dark:border-divider-dark" />
      <div className="h-[57px] border-b border-divider dark:border-divider-dark sm:hidden" />
    </>
  )
}
