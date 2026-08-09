import { FlowMark } from '@/components/ui/flow-mark';
import { Spinner } from '@/components/ui/spinner';
import { formatMonth } from '../calendar-utils';
import { CalendarControls, CalendarViewShortcuts, ViewToggle } from './calendar-controls';
import { NewEventButton } from './new-event-button';
import type { CalendarView } from '../types/calendar';

export function CalendarHeader({ date, view }: { date: string; view: CalendarView }) {
  return (
    <>
      <CalendarViewShortcuts date={date} view={view} />
      <header className="border-divider dark:border-divider-dark flex min-h-14 items-center justify-between border-b px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:w-52">
            <FlowMark className="size-8 shrink-0 sm:hidden" />
            <h1 className="truncate text-lg font-semibold tracking-tight">{formatMonth(date)}</h1>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <CalendarControls date={date} view={view} />
            <ViewToggle date={date} view={view} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Spinner className="calendar-pending-spinner text-muted size-4" />
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
          <span className="bg-card dark:bg-card-dark size-8 rounded-md sm:hidden" />
          <span className="bg-card dark:bg-card-dark h-5 w-28 rounded-md sm:w-40" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="bg-card dark:bg-card-dark h-9 w-9 rounded-md sm:w-28" />
        </div>
      </header>
      <div className="border-divider dark:border-divider-dark flex items-center justify-between border-b px-4 py-2 sm:hidden">
        <span className="bg-card dark:bg-card-dark block h-8 w-36 rounded-md" />
        <span className="bg-card dark:bg-card-dark block h-8 w-20 rounded-md" />
      </div>
    </>
  );
}
