import { ChevronUp, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDay } from '../calendar-utils';
import { chipStyle } from '../utils/colors';
import type { SelectedEvent } from '../hooks/use-calendar-board';
import type { CalendarEvent } from '../types/calendar';
import type { MouseEvent } from 'react';

export function CalendarBoardHeader({
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
  onCreateAllDay: (day: string, event: MouseEvent<HTMLElement>) => void;
  onSelectEvent: (event: SelectedEvent) => void;
  todayKey: string | null;
}) {
  return (
    <>
      <CalendarDayHeaderRow
        days={days}
        gridTemplate={gridTemplate}
        onCreateAllDay={onCreateAllDay}
        todayKey={todayKey}
      />
      <CalendarAllDayRow
        days={days}
        events={events}
        getEffectiveDay={getEffectiveDay}
        gridTemplate={gridTemplate}
        onSelectEvent={onSelectEvent}
        todayKey={todayKey}
      />
    </>
  );
}

function CalendarDayHeaderRow({
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
                className="text-muted focus-visible:ring-accent ml-auto hidden size-8 place-items-center rounded-full transition-colors hover:text-black focus-visible:ring-2 focus-visible:outline-none sm:grid dark:hover:text-white"
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

  if (!canExpand) {
    return (
      <div className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark border-b">{content}</div>
    );
  }

  return (
    <details className="group border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark border-b">
      <summary
        aria-label="Toggle all-day events"
        className="group/summary list-none focus-visible:outline-none [&::-webkit-details-marker]:hidden"
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
