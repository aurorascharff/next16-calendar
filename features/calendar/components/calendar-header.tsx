import { Suspense } from 'react'
import { getCalendars } from '../calendar-queries'
import { CalendarControls, ViewToggle } from './calendar-controls'
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
          <ViewToggle date={date} view={view} />
          <Suspense fallback={<NewEventButtonFallback />}>
            <NewEventLoader day={date} />
          </Suspense>
        </div>
      </header>
      <div className="border-b border-divider px-4 py-2 dark:border-divider-dark sm:hidden">
        <CalendarControls date={date} view={view} />
      </div>
    </>
  )
}

async function NewEventLoader({ day }: { day: string }) {
  const calendars = await getCalendars()
  return <NewEventButton calendars={calendars} day={day} />
}

function NewEventButtonFallback() {
  return <div aria-hidden className="h-[38px] w-11 rounded-md bg-accent/60 sm:w-[7.5rem]" />
}

export function CalendarHeaderSkeleton() {
  return (
    <>
      <div className="min-h-18 border-b border-divider dark:border-divider-dark" />
      <div className="h-[57px] border-b border-divider dark:border-divider-dark sm:hidden" />
    </>
  )
}
