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
        {params.then(({ date }) => searchParams.then(({ view }) => <CalendarHeader date={date} view={toView(view)} />))}
      </Suspense>
      <Suspense fallback={<CalendarWeekSkeleton />}>
        {params.then(({ date }) =>
          searchParams.then(({ view }) => {
            const calendarView = toView(view);

            return (
              <Suspense fallback={<CalendarWeekSkeleton date={date} view={calendarView} />}>
                <RouteTransition slideKey={`${calendarView}:${date}`}>
                  <CalendarWeek date={date} view={calendarView} />
                </RouteTransition>
              </Suspense>
            );
          }),
        )}
      </Suspense>
    </main>
  );
}
