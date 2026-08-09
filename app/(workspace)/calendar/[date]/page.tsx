import { Suspense } from 'react';
import { RouteTransition } from '@/components/ui/route-transition';
import { CalendarHeader, CalendarHeaderSkeleton } from '@/features/calendar/components/calendar-header';
import { CalendarWeek, CalendarWeekSkeleton } from '@/features/calendar/components/calendar-week';
import type { CalendarView } from '@/features/calendar/types/calendar';

function toView(view: string | string[] | undefined): CalendarView {
  return view === 'day' ? 'day' : 'week';
}

export default function CalendarPage({ params, searchParams }: PageProps<'/calendar/[date]'>) {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <Suspense fallback={<CalendarHeaderSkeleton />}>
        {Promise.all([params, searchParams]).then(([{ date }, { view }]) => <CalendarHeader date={date} view={toView(view)} />)}
      </Suspense>
      <RouteTransition>
        <Suspense fallback={<CalendarWeekSkeleton />}>
          {Promise.all([params, searchParams]).then(([{ date }, { view }]) => <CalendarWeek date={date} view={toView(view)} />)}
        </Suspense>
      </RouteTransition>
    </main>
  );
}
