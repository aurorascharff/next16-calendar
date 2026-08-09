import { Suspense, ViewTransition } from 'react';
import { CalendarHeader, CalendarHeaderSkeleton } from '@/features/calendar/components/calendar-header';
import { CalendarWeek, CalendarWeekSkeleton } from '@/features/calendar/components/calendar-week';
import type { CalendarView } from '@/features/calendar/types/calendar';

const weekTransition = {
  'calendar-back': 'week-back',
  'calendar-forward': 'week-forward',
  default: 'none',
};

function toView(view: string | string[] | undefined): CalendarView {
  return view === 'day' ? 'day' : 'week';
}

export default function CalendarPage({ params, searchParams }: PageProps<'/calendar/[date]'>) {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <Suspense fallback={<CalendarHeaderSkeleton />}>
        {params.then(({ date }) => searchParams.then(({ view }) => <CalendarHeader date={date} view={toView(view)} />))}
      </Suspense>
      <ViewTransition default="none" enter={weekTransition} exit={weekTransition} update={weekTransition}>
        <Suspense fallback={<CalendarWeekSkeleton />}>
          {params.then(({ date }) => searchParams.then(({ view }) => <CalendarWeek date={date} view={toView(view)} />))}
        </Suspense>
      </ViewTransition>
    </main>
  );
}
