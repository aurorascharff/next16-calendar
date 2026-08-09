import { Suspense } from 'react';
import { formatDayLong, formatMonth } from '@/features/calendar/calendar-utils';
import { CalendarHeader, CalendarHeaderSkeleton } from '@/features/calendar/components/calendar-header';
import { CalendarWeek, CalendarWeekScroll, CalendarWeekSkeleton } from '@/features/calendar/components/calendar-week';
import type { CalendarView } from '@/features/calendar/types/calendar';
import type { Metadata } from 'next';

function toView(view: string | string[] | undefined): CalendarView {
  return view === 'day' ? 'day' : 'week';
}

export function generateMetadata({ params, searchParams }: PageProps<'/calendar/[date]'>): Promise<Metadata> {
  return Promise.all([params, searchParams]).then(([{ date }, { view }]) => ({
    title: toView(view) === 'day' ? formatDayLong(date) : formatMonth(date),
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
          <CalendarWeekScroll view="week">
            <CalendarWeekSkeleton />
          </CalendarWeekScroll>
        }
      >
        {Promise.all([params, searchParams]).then(([{ date }, { view }]) => {
          const calendarView = toView(view);
          return (
            <CalendarWeekScroll date={date} view={calendarView}>
              <Suspense fallback={<CalendarWeekSkeleton date={date} view={calendarView} />}>
                <CalendarWeek date={date} view={calendarView} />
              </Suspense>
            </CalendarWeekScroll>
          );
        })}
      </Suspense>
    </main>
  );
}
