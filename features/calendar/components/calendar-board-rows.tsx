import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDay } from '../calendar-utils';
import type { MouseEvent } from 'react';

export function CalendarDayHeaderRow({
  days,
  gridTemplate,
  onCreateAllDay,
  todayKey,
}: {
  days: string[];
  gridTemplate: string;
  onCreateAllDay: (day: string, event: MouseEvent<HTMLElement>) => void;
  todayKey: string | null;
}) {
  return (
    <div
      className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark grid border-b"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className="border-divider dark:border-divider-dark border-r" />
      {days.map(day => {
        const [weekday, dayNumber] = formatDay(day).split(' ');
        const isToday = day === todayKey;
        return (
          <div
            className={cn(
              'border-divider dark:border-divider-dark border-r px-3 py-1.5',
              isToday && 'bg-card dark:bg-card-dark',
            )}
            key={day}
          >
            <div className="flex min-w-0 items-center gap-1.5">
              <span className={cn('text-[11px] font-medium uppercase', isToday ? 'text-accent' : 'text-muted')}>
                {weekday}
              </span>
              <span
                className={cn(
                  'inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-base font-semibold tabular-nums',
                  isToday && 'bg-accent text-white',
                )}
              >
                {dayNumber}
              </span>
              <button
                aria-label={`Add all-day event on ${formatDay(day)}`}
                className="text-muted focus-visible:ring-accent ml-auto hidden size-8 place-items-center rounded-full transition-colors hover:text-black focus-visible:ring-2 focus-visible:outline-none dark:hover:text-white sm:grid"
                onClick={event => onCreateAllDay(day, event)}
                type="button"
              >
                <Plus className="size-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
