import { Suspense, ViewTransition } from 'react'
import { CalendarHeader, CalendarHeaderSkeleton } from '@/features/calendar/components/calendar-header'
import { CalendarWeek, CalendarWeekSkeleton } from '@/features/calendar/components/calendar-week'

// The header/controls are pinned (outside the transition); only the grid region
// animates, and only on week navigation. `default: 'none'` is deliberate: it
// keeps in-place data updates (dragging an event, optimistic edits) from
// triggering a transition, which is what caused the whole-grid flash. Direction
// comes from the nav link's `transitionTypes`.
const weekTransition = {
  'calendar-back': 'week-back',
  'calendar-forward': 'week-forward',
  default: 'none',
}

export default function CalendarPage(props: PageProps<'/calendar/[date]'>) {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <Suspense fallback={<CalendarHeaderSkeleton />}>
        {props.params.then(({ date }) => <CalendarHeader date={date} />)}
      </Suspense>
      <ViewTransition default="none" enter={weekTransition} exit={weekTransition} update={weekTransition}>
        <Suspense fallback={<CalendarWeekSkeleton />}>
          {props.params.then(({ date }) => <CalendarWeek date={date} />)}
        </Suspense>
      </ViewTransition>
    </main>
  )
}
