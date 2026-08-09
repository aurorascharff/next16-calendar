import { CalendarControls } from './calendar-controls'
import { NewEventButton } from './new-event-button'
import { formatMonth } from '../calendar-utils'

export function CalendarHeader({ date }: { date: string }) {
  return (
    <>
      <header className="flex min-h-18 items-center justify-between border-b border-divider px-4 sm:px-6 dark:border-divider-dark">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div>
            <p className="text-muted text-xs font-medium">Calendar</p>
            <h1 className="mt-0.5 truncate text-lg font-semibold">{formatMonth(date)}</h1>
          </div>
          <div className="hidden sm:block">
            <CalendarControls date={date} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <NewEventButton day={date} />
        </div>
      </header>
      <div className="border-b border-divider px-4 py-2 dark:border-divider-dark sm:hidden">
        <CalendarControls date={date} />
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
