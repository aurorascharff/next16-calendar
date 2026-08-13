import { MobileCalendarSidebarTrigger } from '@/components/mobile-calendar-sidebar';
import { DirectionalSlide } from '@/components/ui/directional-slide';
import { getCalendarDate } from '../calendar-queries';
import { formatMonth } from '../calendar-utils';
import { CalendarControls, CalendarShortcuts, ViewToggle } from './calendar-controls';
import { CalendarSavingIndicator } from './calendar-saving-indicator';
import { NewEventButton } from './new-event-button';
import type { CalendarView } from '../types/calendar';
import type { ReactNode } from 'react';

export function CalendarHeader({
  date,
  month,
  view,
}: {
  date: string;
  month: ReactNode;
  view: CalendarView;
}) {
  getCalendarDate(date);

  return (
    <>
      <CalendarShortcuts date={date} view={view} />
      <header
        className="border-divider dark:border-divider-dark flex min-h-14 items-center justify-between border-b px-4 pt-[env(safe-area-inset-top)] sm:px-6"
        data-calendar-header
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:w-52">
            <MobileCalendarSidebarTrigger className="-ml-1.5 shrink-0" />
            {month}
            <CalendarSavingIndicator />
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <CalendarControls date={date} view={view} />
            <ViewToggle date={date} view={view} />
          </div>
        </div>
      </header>
      <div className="border-divider dark:border-divider-dark flex items-center justify-between gap-2 border-b px-4 py-3 sm:hidden">
        <CalendarControls date={date} view={view} />
        <ViewToggle date={date} view={view} />
      </div>
      <NewEventButton day={date} />
    </>
  );
}

export async function CalendarHeaderMonth({ date, view }: { date: string; view: CalendarView }) {
  const month = date.slice(0, 7);

  return (
    <>
      <DirectionalSlide key={`calendar-month-title:${month}`} name="calendar-month-title">
        <span className="hidden h-8 w-40 min-w-0 items-center overflow-hidden sm:flex">
          <h1 className="truncate text-lg font-semibold tracking-tight">{formatMonth(date)}</h1>
        </span>
      </DirectionalSlide>
      <DirectionalSlide key={`calendar-mobile-month:${month}`} name="calendar-mobile-month">
        <span className="flex h-8 w-36 items-center overflow-hidden sm:hidden">
          <h1 className="truncate text-lg font-semibold tracking-tight">{formatMonth(date)}</h1>
        </span>
      </DirectionalSlide>
    </>
  );
}

export function CalendarHeaderMonthSkeleton() {
  return (
    <>
      <DirectionalSlide name="calendar-month-title">
        <span className="hidden h-8 w-40 items-center overflow-hidden sm:flex">
          <span className="bg-card dark:bg-card-dark h-5 w-28 rounded-md" />
        </span>
      </DirectionalSlide>
      <DirectionalSlide name="calendar-mobile-month">
        <span className="block h-8 w-36 overflow-hidden sm:hidden">
          <span className="bg-card dark:bg-card-dark block h-8 w-28 rounded-md" />
        </span>
      </DirectionalSlide>
      <span aria-label="Loading calendar controls" className="sr-only" role="status">
        Loading calendar controls
      </span>
    </>
  );
}

export function CalendarHeaderSkeleton() {
  return (
    <>
      <header
        className="border-divider dark:border-divider-dark flex min-h-14 items-center justify-between border-b px-4 pt-[env(safe-area-inset-top)] sm:px-6"
        data-calendar-header
        data-calendar-header-loading
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:w-52">
            <MobileCalendarSidebarTrigger className="-ml-1.5 shrink-0" />
            <CalendarHeaderMonthSkeleton />
          </div>
          <div className="hidden items-center gap-2 sm:flex" aria-hidden>
            <span className="bg-card dark:bg-card-dark h-8 w-14 rounded-md" />
            <span className="bg-card dark:bg-card-dark size-8 rounded-md" />
            <span className="bg-card dark:bg-card-dark size-8 rounded-md" />
            <span className="bg-card dark:bg-card-dark h-8 w-28 rounded-md" />
          </div>
        </div>
      </header>
      <div className="border-divider dark:border-divider-dark flex items-center justify-between border-b px-4 py-3 sm:hidden">
        <div className="flex items-center gap-2" aria-hidden>
          <span className="bg-card dark:bg-card-dark h-8 w-14 rounded-md" />
          <span className="bg-card dark:bg-card-dark size-8 rounded-md" />
          <span className="bg-card dark:bg-card-dark size-8 rounded-md" />
        </div>
        <span className="bg-card dark:bg-card-dark block h-8 w-20 rounded-md" />
      </div>
    </>
  );
}
