import { Suspense } from 'react';
import { SlowControl } from '@/components/demo/slow-control';
import { DaylineMark } from '@/components/ui/dayline-mark';
import { WorkspaceHeaderActions } from '@/components/workspace-header-actions';
import { formatDayLong, formatMonth } from '../calendar-utils';
import { CalendarControls, ViewToggle } from './calendar-controls';
import { NewEventButton } from './new-event-button';
import type { CalendarView } from '../types/calendar';

export function CalendarHeader({ date, view }: { date: string; view: CalendarView }) {
  return (
    <>
      <header className="border-divider dark:border-divider-dark flex min-h-14 items-center justify-between border-b px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:w-52">
            <DaylineMark className="size-8 shrink-0 sm:hidden" />
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {view === 'day' ? formatDayLong(date) : formatMonth(date)}
            </h1>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <CalendarControls date={date} view={view} />
            <ViewToggle date={date} view={view} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <WorkspaceHeaderActions />
          </div>
          <div className="hidden sm:block">
            <Suspense fallback={<div className="h-8 w-[5.5rem]" />}>
              <SlowControl />
            </Suspense>
          </div>
          <NewEventButton day={date} />
        </div>
      </header>
      <div className="border-divider dark:border-divider-dark flex items-center justify-between gap-2 border-b px-4 py-2 sm:hidden">
        <CalendarControls date={date} view={view} />
        <ViewToggle date={date} view={view} />
      </div>
    </>
  );
}

export function CalendarHeaderSkeleton() {
  return (
    <>
      <header className="border-divider dark:border-divider-dark flex min-h-14 items-center justify-between border-b px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <span className="skeleton-animation size-8 rounded-md sm:hidden" />
          <span className="skeleton-animation h-5 w-28 rounded-md sm:w-40" />
          <span className="skeleton-animation hidden h-8 w-44 rounded-md sm:block" />
          <span className="skeleton-animation hidden h-8 w-24 rounded-md sm:block" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="skeleton-animation hidden h-8 w-[5.5rem] rounded-md sm:block" />
          <span className="skeleton-animation h-9 w-9 rounded-md sm:w-28" />
        </div>
      </header>
      <div className="border-divider dark:border-divider-dark flex items-center justify-between border-b px-4 py-2 sm:hidden">
        <span className="skeleton-animation block h-8 w-48 rounded-md" />
        <span className="skeleton-animation block h-8 w-24 rounded-md" />
      </div>
    </>
  );
}
