'use client';

import * as Ariakit from '@ariakit/react';
import { Plus, Repeat } from 'lucide-react';
import { useOptimistic, useState, useTransition } from 'react';
import { IconButton } from '@/components/ui/icon-button';
import { Crossfade } from '@/components/ui/crossfade';
import { cn } from '@/lib/utils';
import { useTodayKey } from '../hooks/use-now';
import { chipStyle, colorStyle } from '../utils/colors';
import { applyEventAction } from '../utils/event-optimistic-reducer';
import { useCalendarVisibility } from './calendar-visibility';
import { EventCreateDialog } from './event-create-dialog';
import { EventPopover } from './event-popover';
import type { ReactNode } from 'react';
import type { Calendar, CalendarEvent } from '../types/calendar';
import type { EventAction } from '../utils/event-optimistic-reducer';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_EVENT_ROWS = 5;

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
          'cal-chip focus-visible:ring-accent pointer-events-auto flex h-6 w-full min-w-0 items-center gap-1 rounded-[5px] px-2 text-left text-xs leading-none font-semibold ring-1 ring-inset focus-visible:ring-2 focus-visible:outline-none',
          event.isBooking && 'cal-chip-booking',
        )}
        onClick={clickEvent => onSelect(clickEvent.currentTarget.getBoundingClientRect())}
        style={chipStyle(event.color)}
        title={event.title}
        type="button"
      >
        <span className="min-w-0 flex-1 truncate">{event.title}</span>
        {event.recurring ? <Repeat className="hidden size-2.5 shrink-0 opacity-50 sm:block" /> : null}
      </button>
    );
  }

  return (
    <button
      className={cn(
        'hover:bg-card dark:hover:bg-card-dark focus-visible:ring-accent pointer-events-auto flex h-6 w-full min-w-0 items-center gap-1 rounded px-1.5 text-left text-xs focus-visible:ring-2 focus-visible:outline-none',
        event.isBooking && 'cal-booking-row',
      )}
      onClick={clickEvent => onSelect(clickEvent.currentTarget.getBoundingClientRect())}
      style={event.isBooking ? chipStyle(event.color) : undefined}
      title={`${event.start} · ${event.title}`}
      type="button"
    >
      <span className="size-1.5 shrink-0 rounded-full" style={colorStyle(event.color)} />
      <span className="text-muted hidden shrink-0 tabular-nums sm:inline">{event.start}</span>
      <span className="min-w-0 flex-1 truncate font-medium">{event.title}</span>
      {event.recurring ? <Repeat className="text-muted hidden size-2.5 shrink-0 sm:block" /> : null}
    </button>
  );
}

export function CalendarMonthBoard({
  calendars,
  days,
  events,
}: {
  calendars: Calendar[];
  days: string[];
  events: CalendarEvent[];
}) {
  const { hidden } = useCalendarVisibility();
  const [optimisticEvents, applyOptimisticEvent] = useOptimistic(events, applyEventAction);
  const [isPending, startTransition] = useTransition();
  const [selectedEvent, setSelectedEvent] = useState<{ anchorRect: DOMRect; event: CalendarEvent } | null>(null);
  const visibleEvents = optimisticEvents.filter(event => !hidden.has(event.calendarId));

  function updateOptimistically(action: EventAction) {
    startTransition(() => applyOptimisticEvent(action));
  }

  return (
    <>
      <Crossfade>
        <div className="pointer-events-none col-start-1 row-start-2 grid auto-rows-[11rem] grid-cols-7">
          {days.map(day => {
            const dayEvents = sortEvents(visibleEvents.filter(event => event.day === day));
            const hasOverflow = dayEvents.length > MAX_EVENT_ROWS;
            const visible = dayEvents.slice(0, hasOverflow ? MAX_EVENT_ROWS - 1 : MAX_EVENT_ROWS);
            const remaining = dayEvents.length - visible.length;
            return (
              <div className="min-w-0 overflow-hidden px-1.5 pt-9 pb-1.5" key={day}>
                <div className="space-y-1">
                  {visible.map(event => (
                    <MonthEvent
                      event={event}
                      key={event.id}
                      onSelect={anchorRect => setSelectedEvent({ anchorRect, event })}
                    />
                  ))}
                  {remaining > 0 ? (
                    <span className="text-muted block h-6 px-1.5 text-xs leading-6 font-medium">+{remaining} more</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Crossfade>
      {isPending ? (
        <span className="sr-only" data-calendar-pending role="status">
          Saving calendar changes
        </span>
      ) : null}
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
    </>
  );
}

export function CalendarMonthFrame({
  children,
  date,
  days,
}: {
  children: ReactNode;
  date: string;
  days: string[];
}) {
  const [createDraft, setCreateDraft] = useState<{ anchorRect: DOMRect; day: string } | null>(null);
  const createStore = Ariakit.usePopoverStore({
    placement: 'bottom-start',
    setOpen(open) {
      if (!open) setCreateDraft(null);
    },
  });
  const today = useTodayKey();
  const month = date.slice(0, 7);

  return (
    <div className="relative grid min-h-full min-w-[760px] select-none [grid-template-rows:auto_auto]">
      <div className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark sticky top-0 z-20 col-start-1 row-start-1 grid grid-cols-7 border-b">
        {WEEKDAY_LABELS.map(label => (
          <div
            className="text-muted border-divider dark:border-divider-dark border-r px-2 py-2 text-center text-[11px] font-semibold uppercase"
            key={label}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="col-start-1 row-start-2 grid auto-rows-[11rem] grid-cols-7">
        {days.map(day => {
          const outside = !day.startsWith(month);
          return (
            <div
              className={cn(
                'group border-divider dark:border-divider-dark overflow-hidden border-r border-b p-1.5',
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
                  className="hidden sm:inline-flex sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  label={`Add event on ${day}`}
                  onClick={event => {
                    setCreateDraft({ anchorRect: event.currentTarget.getBoundingClientRect(), day });
                    createStore.show();
                  }}
                  size="sm"
                >
                  <Plus className="size-4" />
                </IconButton>
              </div>
            </div>
          );
        })}
      </div>
      {children}
      {createDraft ? (
        <EventCreateDialog
          anchorRect={createDraft.anchorRect}
          day={createDraft.day}
          defaultAllDay
          key={createDraft.day}
          store={createStore}
        />
      ) : null}
    </div>
  );
}
