import { MobileCalendarSidebarTrigger } from '@/components/mobile-calendar-sidebar';
import { FlowMark } from '@/components/ui/flow-mark';
import { Spinner } from '@/components/ui/spinner';
import { formatMonth } from '../calendar-utils';
import { CalendarControls, CalendarShortcuts, DatePicker, ViewToggle } from './calendar-controls';
import { NewEventButton } from './new-event-button';
import type { CalendarView } from '../types/calendar';

export function CalendarHeader({ date, view }: { date: string; view: CalendarView }) {
  return (
    <>
      <CalendarShortcuts date={date} view={view} />
      <header className="border-divider dark:border-divider-dark flex min-h-14 items-center justify-between border-b px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:w-52">
            <FlowMark className="size-8 shrink-0 sm:hidden" />
            <h1 className="hidden truncate text-lg font-semibold tracking-tight sm:block">{formatMonth(date)}</h1>
            <DatePicker date={date} label="month" view={view} />
            <span className="calendar-saving-indicator text-accent grid size-5 shrink-0 place-items-center" aria-hidden>
              <Spinner className="size-4 motion-reduce:animate-none" />
            </span>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <CalendarControls date={date} view={view} />
            <ViewToggle date={date} view={view} />
          </div>
        </div>
      </header>
      <div className="border-divider dark:border-divider-dark flex items-center justify-between gap-2 border-b px-4 py-2 sm:hidden">
        <div className="flex items-center gap-1">
          <MobileCalendarSidebarTrigger />
          <CalendarControls date={date} showDatePicker={false} view={view} />
        </div>
        <ViewToggle date={date} view={view} />
      </div>
      <NewEventButton day={date} />
    </>
  );
}

export function CalendarHeaderSkeleton() {
  return (
    <>
      <header className="border-divider dark:border-divider-dark flex min-h-14 items-center justify-between border-b px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <span className="bg-card dark:bg-card-dark size-8 rounded-md sm:hidden" />
          <span className="bg-card dark:bg-card-dark h-5 w-28 rounded-md sm:w-40" />
        </div>
      </header>
      <div className="border-divider dark:border-divider-dark flex items-center justify-between border-b px-4 py-2 sm:hidden">
        <div className="flex items-center gap-1">
          <MobileCalendarSidebarTrigger />
          <span className="bg-card dark:bg-card-dark block h-8 w-36 rounded-md" />
        </div>
        <span className="bg-card dark:bg-card-dark block h-8 w-20 rounded-md" />
      </div>
    </>
  );
}
