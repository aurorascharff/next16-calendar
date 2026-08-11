import { Suspense } from 'react';
import ErrorBoundary from '@/components/ui/error-boundary';
import { getCalendarDate } from '@/features/calendar/calendar-queries';
import { formatMonth } from '@/features/calendar/calendar-utils';
import { CalendarHeader, CalendarHeaderSkeleton } from '@/features/calendar/components/calendar-header';
import {
  CalendarMonth,
  CalendarMonthEventsFallback,
  CalendarMonthScroll,
  CalendarMonthSurface,
} from '@/features/calendar/components/calendar-month';
import { CalendarViewFallback } from '@/features/calendar/components/calendar-scroll-section';
import {
  CalendarWeek,
  CalendarWeekEventsFallback,
  CalendarWeekFrame,
  CalendarWeekScroll,
} from '@/features/calendar/components/calendar-week';
import type { CalendarView } from '@/features/calendar/types/calendar';
import { CalendarEventsProvider } from '@/providers/calendar-events-provider';
import type { Metadata } from 'next';

function toView(view: string | string[] | undefined): CalendarView {
  return view === 'month' ? 'month' : 'week';
}

export function generateMetadata({ params }: PageProps<'/calendar/[date]'>): Promise<Metadata> {
  return params.then(({ date }) => ({
    title: formatMonth(getCalendarDate(date)),
  }));
}

export default function CalendarPage({ params, searchParams }: PageProps<'/calendar/[date]'>) {
  return (
    <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
      <CalendarEventsProvider>
        <Suspense fallback={<CalendarHeaderSkeleton />}>
          {Promise.all([params, searchParams]).then(([{ date }, { view }]) => (
            <CalendarHeader date={date} view={toView(view)} />
          ))}
        </Suspense>
        <ErrorBoundary title="Calendar unavailable">
          <Suspense fallback={<CalendarViewFallback />}>
            {Promise.all([params, searchParams]).then(([{ date }, { view }]) => {
              const calendarView = toView(view);
              return calendarView === 'month' ? (
                <CalendarMonthScroll date={date}>
                  <CalendarMonthSurface date={date}>
                    <Suspense fallback={<CalendarMonthEventsFallback />}>
                      <CalendarMonth date={date} />
                    </Suspense>
                  </CalendarMonthSurface>
                </CalendarMonthScroll>
              ) : (
                <CalendarWeekScroll date={date}>
                  <CalendarWeekFrame date={date}>
                    <Suspense fallback={<CalendarWeekEventsFallback />}>
                      <CalendarWeek date={date} />
                    </Suspense>
                  </CalendarWeekFrame>
                </CalendarWeekScroll>
              );
            })}
          </Suspense>
        </ErrorBoundary>
      </CalendarEventsProvider>
    </main>
  );
}
