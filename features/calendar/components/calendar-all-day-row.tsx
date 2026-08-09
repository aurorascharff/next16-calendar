import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDay } from '../calendar-utils';
import { chipStyle } from '../utils/colors';
import type { SelectedEvent } from '../hooks/use-calendar-board';
import type { CalendarEvent } from '../types/calendar';

export function CalendarAllDayRow({
  days,
  events,
  getEffectiveDay,
  gridTemplate,
  onSelectEvent,
  todayKey,
}: {
  days: string[];
  events: CalendarEvent[];
  getEffectiveDay: (event: CalendarEvent) => string;
  gridTemplate: string;
  onSelectEvent: (event: SelectedEvent) => void;
  todayKey: string | null;
}) {
  const eventsByDay = new Map(days.map(day => [day, events.filter(event => getEffectiveDay(event) === day)]));
  const canExpand = Array.from(eventsByDay.values()).some(dayEvents => dayEvents.length > 1);

  const preview = (
    <div className="grid min-h-8" style={{ gridTemplateColumns: gridTemplate }}>
      <div className="border-divider dark:border-divider-dark text-muted flex items-center justify-center border-r">
        {canExpand ? (
          <span className="all-day-chevron group-focus-visible/summary:ring-accent grid size-6 place-items-center rounded-full transition-transform group-open:rotate-180 group-focus-visible/summary:ring-2">
            <ChevronDown className="size-3.5" />
          </span>
        ) : null}
      </div>
      {days.map(day => {
        const dayEvents = eventsByDay.get(day) ?? [];
        const hiddenEventCount = Math.max(0, dayEvents.length - 1);
        return (
          <div
            className={cn(
              'border-divider dark:border-divider-dark flex min-w-0 items-center gap-1 border-r p-1 group-open:pb-0.5',
              day === todayKey && 'bg-card dark:bg-card-dark',
            )}
            key={day}
          >
            {dayEvents[0] ? (
              <span className="min-w-0 flex-1">
                <AllDayEventButton event={dayEvents[0]} onSelectEvent={onSelectEvent} preventToggle={canExpand} />
              </span>
            ) : null}
            {hiddenEventCount > 0 ? (
              <span
                aria-label={`${hiddenEventCount} more all-day events on ${formatDay(day)}`}
                className="bg-card text-muted dark:bg-card-dark ring-divider dark:ring-divider-dark h-6 shrink-0 rounded-[5px] px-2 text-[11px] leading-6 font-semibold ring-1 group-open:hidden"
              >
                +{hiddenEventCount}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  if (!canExpand) {
    return (
      <div className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark border-b">{preview}</div>
    );
  }

  return (
    <details className="group border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark border-b">
      <summary
        aria-label="Toggle all-day events"
        className="group/summary list-none focus-visible:outline-none [&::-webkit-details-marker]:hidden"
      >
        {preview}
      </summary>
      <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
        <div className="border-divider dark:border-divider-dark border-r" />
        {days.map(day => {
          const remainingEvents = (eventsByDay.get(day) ?? []).slice(1);
          return (
            <div
              className={cn(
                'border-divider dark:border-divider-dark flex min-w-0 flex-col gap-0.5 border-r px-1 pb-1',
                day === todayKey && 'bg-card dark:bg-card-dark',
              )}
              key={day}
            >
              {remainingEvents.map(event => (
                <AllDayEventButton event={event} key={event.id} onSelectEvent={onSelectEvent} />
              ))}
            </div>
          );
        })}
      </div>
    </details>
  );
}

function AllDayEventButton({
  event,
  onSelectEvent,
  preventToggle = false,
}: {
  event: CalendarEvent;
  onSelectEvent: (event: SelectedEvent) => void;
  preventToggle?: boolean;
}) {
  return (
    <button
      className="cal-chip focus-visible:ring-accent flex h-6 w-full min-w-0 flex-none items-center gap-1 rounded-[5px] px-2 text-left text-[11px] leading-none font-semibold ring-1 ring-inset focus-visible:ring-2 focus-visible:outline-none"
      onClick={click => {
        if (preventToggle) {
          click.preventDefault();
          click.stopPropagation();
        }
        onSelectEvent({ anchorRect: click.currentTarget.getBoundingClientRect(), event });
      }}
      style={chipStyle(event.color)}
      type="button"
    >
      <span className="truncate">{event.title}</span>
    </button>
  );
}
