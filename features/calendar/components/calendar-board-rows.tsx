'use client';

import { cn } from '@/lib/utils';
import { formatDay } from '../calendar-utils';
import { chipStyle } from '../utils/colors';
import type { SelectedEvent } from '../hooks/use-calendar-board';
import type { CalendarEvent } from '../types/calendar';

export function CalendarDayHeaderRow({
  days,
  gridTemplate,
  todayKey,
}: {
  days: string[];
  gridTemplate: string;
  todayKey: string | null;
}) {
  return (
    <div
      className="border-divider bg-surface/90 dark:border-divider-dark dark:bg-surface-dark/90 grid border-b backdrop-blur"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className="border-divider dark:border-divider-dark border-r" />
      {days.map(day => {
        const [weekday, dayNumber] = formatDay(day).split(' ');
        const isToday = day === todayKey;
        return (
          <div
            className={cn(
              'border-divider dark:border-divider-dark flex items-center gap-1.5 border-r px-3 py-1.5 text-left',
              isToday && 'bg-card dark:bg-card-dark',
            )}
            key={day}
          >
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
          </div>
        );
      })}
    </div>
  );
}

export function CalendarAllDayRow({
  days,
  events,
  getEffectiveDay,
  gridTemplate,
  onCreateAllDay,
  onSelectEvent,
  todayKey,
}: {
  days: string[];
  events: CalendarEvent[];
  getEffectiveDay: (event: CalendarEvent) => string;
  gridTemplate: string;
  onCreateAllDay: (day: string, event: React.MouseEvent<HTMLElement>) => void;
  onSelectEvent: (event: SelectedEvent) => void;
  todayKey: string | null;
}) {
  return (
    <div
      className="border-divider dark:border-divider-dark bg-surface/70 dark:bg-surface-dark/70 grid border-b"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className="border-divider dark:border-divider-dark text-muted flex items-center justify-end border-r px-3 py-1.5 text-[11px] font-medium">
        All day
      </div>
      {days.map(day => {
        const dayEvents = events.filter(event => getEffectiveDay(event) === day);
        const isToday = day === todayKey;
        return (
          <div
            className={cn(
              'border-divider dark:border-divider-dark min-h-9 border-r p-1',
              isToday && 'bg-card dark:bg-card-dark',
            )}
            key={day}
          >
            <button
              aria-label={`Add all-day event on ${formatDay(day)}`}
              className="focus-visible:ring-accent group hover:bg-card focus-visible:bg-card dark:hover:bg-card-dark dark:focus-visible:bg-card-dark flex min-h-7 w-full flex-col gap-1 rounded-md text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
              onClick={event => onCreateAllDay(day, event)}
              type="button"
            >
              {dayEvents.length ? (
                dayEvents.map(event => (
                  <span
                    className="cal-chip flex min-w-0 items-center gap-1 rounded-[5px] px-2 py-1 text-xs font-semibold ring-1 ring-inset"
                    key={event.id}
                    onClick={click => {
                      click.stopPropagation();
                      onSelectEvent({ anchorRect: click.currentTarget.getBoundingClientRect(), event });
                    }}
                    style={chipStyle(event.color)}
                  >
                    <span className="truncate">{event.title}</span>
                  </span>
                ))
              ) : (
                <span className="sr-only">New all-day event</span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
