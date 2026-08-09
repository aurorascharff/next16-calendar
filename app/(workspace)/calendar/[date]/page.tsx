import { Suspense, ViewTransition } from 'react'
import { CalendarHeader, CalendarHeaderSkeleton } from '@/features/calendar/components/calendar-header'
import { CalendarWeek, CalendarWeekSkeleton } from '@/features/calendar/components/calendar-week'
import type { CalendarView } from '@/features/calendar/types/calendar'

const weekTransition = {
  'calendar-back': 'week-back',
  'calendar-forward': 'week-forward',
  default: 'none',
}

export default function CalendarPage(props: PageProps<'/calendar/[date]'>) {
  const resolved = Promise.all([props.params, props.searchParams]).then(([{ date }, { view }]) => ({
    date,
    view: (view === 'day' ? 'day' : 'week') as CalendarView,
  }))

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <Suspense fallback={<CalendarHeaderSkeleton />}>
        {resolved.then(({ date, view }) => <CalendarHeader date={date} view={view} />)}
      </Suspense>
      <ViewTransition default="none" enter={weekTransition} exit={weekTransition} update={weekTransition}>
        <Suspense fallback={<CalendarWeekSkeleton />}>
          {resolved.then(({ date, view }) => <CalendarWeek date={date} view={view} />)}
        </Suspense>
      </ViewTransition>
    </main>
  )
}
