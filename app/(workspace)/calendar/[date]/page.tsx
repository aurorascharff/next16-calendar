import { Suspense } from 'react';
import { formatMonth } from '@/features/calendar/calendar-utils';
import { CalendarHeader, CalendarHeaderSkeleton } from '@/features/calendar/components/calendar-header';
import {
  CalendarMonth,
  CalendarMonthScroll,
  CalendarMonthSkeleton,
} from '@/features/calendar/components/calendar-month';
import { CalendarWeek, CalendarWeekScroll, CalendarWeekSkeleton } from '@/features/calendar/components/calendar-week';
import type { CalendarView } from '@/features/calendar/types/calendar';
import type { Metadata } from 'next';

function toView(view: string | string[] | undefined): CalendarView {
  return view === 'month' ? 'month' : 'week';
}

export function generateMetadata({ params }: PageProps<'/calendar/[date]'>): Promise<Metadata> {
  return params.then(({ date }) => ({
    title: formatMonth(date),
  }));
}

export default function CalendarPage({ params, searchParams }: PageProps<'/calendar/[date]'>) {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <Suspense fallback={<CalendarHeaderSkeleton />}>
        {Promise.all([params, searchParams]).then(([{ date }, { view }]) => (
          <CalendarHeader date={date} view={toView(view)} />
        ))}
      </Suspense>
      <Suspense
        fallback={
          <CalendarWeekScroll>
            <CalendarWeekSkeleton />
          </CalendarWeekScroll>
        }
      >
        {Promise.all([params, searchParams]).then(([{ date }, { view }]) => {
          const calendarView = toView(view);
          return calendarView === 'month' ? (
            <CalendarMonthScroll>
              <Suspense fallback={<CalendarMonthSkeleton date={date} />}>
                <CalendarMonth date={date} />
              </Suspense>
            </CalendarMonthScroll>
          ) : (
            <CalendarWeekScroll date={date}>
              <Suspense fallback={<CalendarWeekSkeleton date={date} />}>
                <CalendarWeek date={date} />
              </Suspense>
            </CalendarWeekScroll>
          );
        })}
      </Suspense>
    </main>
  );
}
