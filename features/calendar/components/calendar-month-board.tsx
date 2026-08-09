'use client';

import * as Ariakit from '@ariakit/react';
import { Plus, Repeat } from 'lucide-react';
import { useOptimistic, useState, useTransition } from 'react';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { useCalendarVisibility } from './calendar-visibility';
import { EventCreateDialog } from './event-create-dialog';
import { EventPopover } from './event-popover';
import { useTodayKey } from '../hooks/use-now';
import { chipStyle, colorStyle } from '../utils/colors';
import { applyEventAction, expandOptimisticEvent } from '../utils/event-optimistic-reducer';
import type { Calendar, CalendarEvent } from '../types/calendar';
import type { EventAction } from '../utils/event-optimistic-reducer';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_EVENT_ROWS = 4;

function sortEvents(events: CalendarEvent[]) {
  return [...events].sort((left, right) => {
    if (left.allDay !== right.allDay) return left.allDay ? -1 : 1;
    return left.start.localeCompare(right.start) || left.title.localeCompare(right.title);
  });
}

function MonthEvent({ event, onSelect }: { event: CalendarEvent; onSelect: (rect: DOMRect) => void }) {
  if (event.allDay) {
    return (
      <button
        className={cn(
          'cal-chip focus-visible:ring-accent flex h-5 w-full min-w-0 items-center gap-1 rounded-[4px] px-1.5 text-left text-[11px] leading-none font-semibold ring-1 ring-inset focus-visible:ring-2 focus-visible:outline-none',
          event.isBooking && 'cal-chip-booking',
        )}
        onClick={clickEvent => onSelect(clickEvent.currentTarget.getBoundingClientRect())}
        style={chipStyle(event.color)}
        title={event.title}
        type="button"
      >
        <span className="min-w-0 flex-1 truncate">{event.title}</span>
        {event.recurring ? <Repeat className="size-2.5 shrink-0 opacity-50" /> : null}
      </button>
    );
  }

  return (
    <button
      className={cn(
        'hover:bg-card dark:hover:bg-card-dark focus-visible:ring-accent flex h-5 w-full min-w-0 items-center gap-1 rounded px-1 text-left text-[11px] focus-visible:ring-2 focus-visible:outline-none',
        event.isBooking && 'ring-divider dark:ring-divider-dark ring-1 ring-inset',
      )}
      onClick={clickEvent => onSelect(clickEvent.currentTarget.getBoundingClientRect())}
      title={`${event.start} · ${event.title}`}
      type="button"
    >
      <span className="size-1.5 shrink-0 rounded-full" style={colorStyle(event.color)} />
      <span className="text-muted shrink-0 tabular-nums">{event.start}</span>
      <span className="min-w-0 flex-1 truncate font-medium">{event.title}</span>
      {event.recurring ? <Repeat className="text-muted size-2.5 shrink-0" /> : null}
    </button>
  );
}

export function CalendarMonthBoard({
  calendars,
  date,
  days,
  events,
}: {
  calendars: Calendar[];
  date: string;
  days: string[];
  events: CalendarEvent[];
}) {
  const { hidden } = useCalendarVisibility();
  const [optimisticEvents, applyOptimisticEvent] = useOptimistic(events, applyEventAction);
  const [isPending, startTransition] = useTransition();
  const [selectedEvent, setSelectedEvent] = useState<{ anchorRect: DOMRect; event: CalendarEvent } | null>(null);
  const [createDraft, setCreateDraft] = useState<{ anchorRect: DOMRect; day: string } | null>(null);
  const createStore = Ariakit.usePopoverStore({
    placement: 'bottom-start',
    setOpen(open) {
      if (!open) setCreateDraft(null);
    },
  });
  const today = useTodayKey();
  const month = date.slice(0, 7);
  const writable = calendars.filter(calendar => !calendar.isDemo);
  const defaultCalendar = writable[0] ?? calendars[0];
  const visibleEvents = optimisticEvents.filter(event => !hidden.has(event.calendarId));

  function updateOptimistically(action: EventAction) {
    startTransition(() => applyOptimisticEvent(action));
  }

  function openCreate(day: string, target: HTMLElement) {
    setCreateDraft({ anchorRect: target.getBoundingClientRect(), day });
    createStore.show();
  }

  return (
    <div className="relative flex min-h-full min-w-[760px] flex-col select-none">
      {isPending ? (
        <span className="sr-only" data-calendar-pending role="status">
          Saving calendar changes
        </span>
      ) : null}
      <div className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark sticky top-0 z-20 grid grid-cols-7 border-b">
        {WEEKDAY_LABELS.map(label => (
          <div
            className="text-muted border-divider dark:border-divider-dark border-r px-2 py-2 text-center text-[11px] font-semibold uppercase"
            key={label}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid min-h-[48rem] flex-1 grid-cols-7 grid-rows-6">
        {days.map(day => {
          const outside = !day.startsWith(month);
          const dayEvents = sortEvents(visibleEvents.filter(event => event.day === day));
          const hasOverflow = dayEvents.length > MAX_EVENT_ROWS;
          const visible = dayEvents.slice(0, hasOverflow ? MAX_EVENT_ROWS - 1 : MAX_EVENT_ROWS);
          const remaining = dayEvents.length - visible.length;
          return (
            <div
              className={cn(
                'group border-divider dark:border-divider-dark min-h-32 overflow-hidden border-r border-b p-1',
                day === today && 'bg-card/45 dark:bg-card-dark/45',
                outside && 'bg-card/25 dark:bg-card-dark/20',
              )}
              key={day}
            >
              <div className="mb-0.5 flex h-7 items-center justify-between pl-1">
                <span
                  className={cn(
                    'grid size-6 place-items-center rounded-full text-xs font-medium tabular-nums',
                    day === today && 'bg-accent font-semibold text-white',
                    outside && day !== today && 'text-muted/45',
                  )}
                >
                  {Number(day.slice(-2))}
                </span>
                <IconButton
                  className="sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  label={`Add event on ${day}`}
                  onClick={event => openCreate(day, event.currentTarget)}
                  size="sm"
                >
                  <Plus className="size-4" />
                </IconButton>
              </div>
              <div className="space-y-0.5">
                {visible.map(event => (
                  <MonthEvent
                    event={event}
                    key={event.id}
                    onSelect={anchorRect => setSelectedEvent({ anchorRect, event })}
                  />
                ))}
                {remaining > 0 ? (
                  <span className="text-muted block h-5 px-1 text-[11px] leading-5 font-medium">+{remaining} more</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {selectedEvent ? (
        <EventPopover
          anchorRect={selectedEvent.anchorRect}
          calendar={calendars.find(calendar => calendar.id === selectedEvent.event.calendarId)}
          event={selectedEvent.event}
          key={selectedEvent.event.id}
          onClose={() => setSelectedEvent(null)}
          onDeleted={sourceId => updateOptimistically({ sourceId, type: 'delete' })}
          onUpdated={event => updateOptimistically({ event, type: 'update' })}
        />
      ) : null}
      {createDraft ? (
        <EventCreateDialog
          anchorRect={createDraft.anchorRect}
          calendars={calendars}
          day={createDraft.day}
          defaultCalendarId={defaultCalendar?.id}
          key={createDraft.day}
          onCreated={event => {
            for (const createdEvent of expandOptimisticEvent(event, days)) {
              updateOptimistically({ event: createdEvent, type: 'create' });
            }
          }}
          onCreateFailed={sourceId => updateOptimistically({ sourceId, type: 'delete' })}
          store={createStore}
        />
      ) : null}
    </div>
  );
}
