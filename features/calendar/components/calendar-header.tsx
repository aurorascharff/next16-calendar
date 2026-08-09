import { formatDayLong, formatMonth } from '../calendar-utils';
import { CalendarControls, ViewToggle } from './calendar-controls';
import { NewEventButton } from './new-event-button';
import type { CalendarView } from '../types/calendar';

export function CalendarHeader({ date, view }: { date: string; view: CalendarView }) {
  return (
    <>
      <header className="border-divider dark:border-divider-dark flex min-h-14 items-center justify-between border-b px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <h1 className="shrink-0 truncate text-lg font-semibold tracking-tight sm:w-52">
            {view === 'day' ? formatDayLong(date) : formatMonth(date)}
          </h1>
          <div className="hidden sm:block">
            <CalendarControls date={date} view={view} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ViewToggle date={date} view={view} />
          <NewEventButton day={date} />
        </div>
      </header>
      <div className="border-divider dark:border-divider-dark border-b px-4 py-2 sm:hidden">
        <CalendarControls date={date} view={view} />
      </div>
    </>
  );
}

export function CalendarHeaderSkeleton() {
  return (
    <>
      <div className="border-divider dark:border-divider-dark min-h-14 border-b" />
      <div className="border-divider dark:border-divider-dark h-[57px] border-b sm:hidden" />
    </>
  );
}
