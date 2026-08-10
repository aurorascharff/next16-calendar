import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDay } from '../calendar-utils';
import { chipStyle } from '../utils/colors';
import type { SelectedEvent } from '../hooks/use-calendar-board';
import type { CalendarEvent } from '../types/calendar';

export function CalendarBoardHeader({
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
  return (
    <CalendarAllDayRow
      days={days}
      events={events}
      getEffectiveDay={getEffectiveDay}
      gridTemplate={gridTemplate}
      onSelectEvent={onSelectEvent}
      todayKey={todayKey}
    />
  );
}

function CalendarAllDayRow({
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

  const content = (
    <div className="grid min-h-8" style={{ gridTemplateColumns: gridTemplate }}>
      <div className="border-divider dark:border-divider-dark text-muted flex items-start justify-center border-r p-1">
        {canExpand ? (
          <span className="group-focus-visible/summary:ring-accent hidden size-6 place-items-center rounded-full group-open:grid group-focus-visible/summary:ring-2">
            <ChevronUp className="size-3.5" />
          </span>
        ) : null}
      </div>
      {days.map(day => {
        const dayEvents = eventsByDay.get(day) ?? [];
        const hiddenEventCount = Math.max(0, dayEvents.length - 1);
        return (
          <div
            className={cn(
              'border-divider dark:border-divider-dark flex min-w-0 flex-col gap-0.5 border-r p-1',
              day === todayKey && 'bg-card dark:bg-card-dark',
            )}
            key={day}
          >
            <div className="flex min-w-0 gap-1">
              {dayEvents[0] ? (
                <span className="min-w-0 flex-1">
                  <AllDayEventButton event={dayEvents[0]} onSelectEvent={onSelectEvent} preventToggle={canExpand} />
                </span>
              ) : null}
              {hiddenEventCount > 0 ? (
                <span
                  aria-label={`${hiddenEventCount} more all-day events on ${formatDay(day)}`}
                  className="text-muted hidden h-6 shrink-0 px-1 text-[11px] leading-6 font-semibold group-open:hidden sm:inline"
                >
                  +{hiddenEventCount}
                </span>
              ) : null}
            </div>
            {dayEvents.slice(1).map(event => (
              <span className="hidden group-open:block" key={event.id}>
                <AllDayEventButton event={event} onSelectEvent={onSelectEvent} preventToggle />
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );

  return (
    <details className="group border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark sticky top-10 z-40 col-start-1 row-start-2 border-b">
      <summary
        aria-disabled={!canExpand || undefined}
        aria-label={canExpand ? 'Toggle all-day events' : 'All-day events'}
        className="group/summary list-none focus-visible:outline-none [&::-webkit-details-marker]:hidden"
        onClick={event => {
          if (!canExpand) event.preventDefault();
        }}
        tabIndex={canExpand ? 0 : -1}
      >
        {content}
      </summary>
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
      className="cal-chip focus-visible:ring-accent flex h-6 w-full min-w-0 flex-none items-center gap-1 rounded-[5px] px-2 text-left text-xs leading-none font-semibold ring-1 ring-inset focus-visible:ring-2 focus-visible:outline-none"
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
