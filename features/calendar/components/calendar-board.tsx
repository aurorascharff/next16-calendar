'use client';

import * as Ariakit from '@ariakit/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { IconButton } from '@/components/ui/icon-button';
import { Crossfade } from '@/components/ui/crossfade';
import { cn } from '@/lib/utils';
import { formatDay } from '../calendar-utils';
import { useCalendarBoard } from '../hooks/use-calendar-board';
import { useTodayKey } from '../hooks/use-now';
import { expandOptimisticEvent } from '../utils/event-optimistic-reducer';
import {
  DAY_COLUMN_MIN_WIDTH,
  GRID_HEIGHT,
  HOURS,
  TIME_COLUMN_WIDTH,
} from '../utils/grid';
import { CalendarBoardHeader } from './calendar-board-header';
import { CalendarEventLayer, DayColumn } from './calendar-day-column';
import { EventCreateDialog } from './event-create-dialog';
import { EventPopover } from './event-popover';
import type { ReactNode } from 'react';
import type { Calendar, CalendarEvent } from '../types/calendar';

export function CalendarBoard({
  calendars,
  days,
  events,
}: {
  calendars: Calendar[];
  days: string[];
  events: CalendarEvent[];
}) {
  const {
    allDayEvents,
    createDraft,
    createStore,
    defaultCalendar,
    effectiveDay,
    gridMinWidth,
    gridRef,
    gridTemplate,
    interactions,
    isPending,
    nowMinutes,
    selectedEvent,
    addOptimisticEvent,
    setSelectedEvent,
    todayKey,
    visibleEvents,
  } = useCalendarBoard({ calendars, days, events });

  return (
    <>
      <Crossfade>
        <CalendarBoardHeader
          days={days}
          events={allDayEvents}
          getEffectiveDay={effectiveDay}
          gridTemplate={gridTemplate}
          onSelectEvent={setSelectedEvent}
          todayKey={todayKey}
        />
      </Crossfade>
      <Crossfade>
        <div
          className="relative col-start-1 row-start-3 grid"
          ref={gridRef}
          style={{ gridTemplateColumns: gridTemplate, minWidth: gridMinWidth }}
        >
          <div />
          {days.map(day => {
            const isToday = day === todayKey;
            return (
              <DayColumn
                day={day}
                interaction={interactions}
                isToday={isToday}
                key={day}
                nowMinutes={nowMinutes}
                renderGrid={false}
                showNow={isToday}
              />
            );
          })}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 left-[4.5rem] z-10 grid"
            style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
          >
            {days.map(day => (
              <div className="relative min-w-0" data-day-column key={day}>
                <CalendarEventLayer
                  events={visibleEvents.filter(event => !event.allDay && effectiveDay(event) === day)}
                  interaction={interactions}
                />
              </div>
            ))}
          </div>
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
          onDeleted={sourceId => addOptimisticEvent({ sourceId, type: 'delete' })}
          onUpdated={event => addOptimisticEvent({ event, type: 'update' })}
        />
      ) : null}
      {createDraft ? (
        <EventCreateDialog
          calendars={calendars}
          anchorRect={createDraft.anchorRect}
          day={createDraft.day}
          defaultAllDay={createDraft.allDay}
          defaultCalendarId={defaultCalendar?.id}
          defaultDuration={createDraft.duration}
          defaultStart={createDraft.start}
          key={`${createDraft.day}-${createDraft.start}-${createDraft.duration}-${createDraft.allDay}`}
          onCreated={event => {
            for (const createdEvent of expandOptimisticEvent(event, days)) {
              addOptimisticEvent({ event: createdEvent, type: 'create' });
            }
          }}
          onCreateFailed={sourceId => addOptimisticEvent({ sourceId, type: 'delete' })}
          store={createStore}
        />
      ) : null}
    </>
  );
}

export function CalendarBoardFrame({
  children,
  days,
  fallbackCount = 7,
}: {
  children?: ReactNode;
  days?: string[];
  fallbackCount?: number;
}) {
  const dayKeys = days ?? Array.from({ length: fallbackCount }, () => null);
  const [createDraft, setCreateDraft] = useState<{ anchorRect: DOMRect; day: string } | null>(null);
  const createStore = Ariakit.usePopoverStore({
    placement: 'bottom-start',
    setOpen(open) {
      if (!open) setCreateDraft(null);
    },
  });
  const todayKey = useTodayKey();
  const gridTemplate = `${TIME_COLUMN_WIDTH}px repeat(${dayKeys.length}, minmax(${DAY_COLUMN_MIN_WIDTH}px, 1fr))`;
  const minWidth =
    dayKeys.length > 1 ? TIME_COLUMN_WIDTH + dayKeys.length * DAY_COLUMN_MIN_WIDTH : undefined;
  return (
    <div className="relative grid [grid-template-rows:auto_auto_auto] select-none">
      <div className="sticky top-0 z-30 col-start-1 row-start-1" style={{ minWidth }}>
        <div
          className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark grid border-b"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className="border-divider dark:border-divider-dark border-r" />
          {dayKeys.map((day, index) => {
            const [weekday, dayNumber] = day ? formatDay(day).split(' ') : ['', ''];
            const isToday = day === todayKey;
            return (
              <div
                className={cn(
                  'border-divider dark:border-divider-dark border-r px-3 py-1.5',
                  isToday && 'bg-card dark:bg-card-dark',
                )}
                key={index}
              >
                {day ? (
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
                    <IconButton
                      className="ml-auto hidden sm:inline-flex"
                      label={`Add all-day event on ${formatDay(day)}`}
                      onClick={event => {
                        setCreateDraft({ anchorRect: event.currentTarget.getBoundingClientRect(), day });
                        createStore.show();
                      }}
                      size="sm"
                    >
                      <Plus className="size-5" />
                    </IconButton>
                  </div>
                ) : (
                  <div className="flex min-w-0 items-center gap-1.5" aria-hidden>
                    <span className="bg-divider/60 dark:bg-divider-dark h-2 w-7 rounded-full" />
                    <span className="skeleton-animation size-7 shrink-0 rounded-full" />
                    <span className="ml-auto size-8" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <details className="group border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark sticky top-10 z-30 col-start-1 row-start-2 border-b">
        <summary
          aria-hidden
          className="list-none [&::-webkit-details-marker]:hidden"
          onClick={event => event.preventDefault()}
          tabIndex={-1}
        >
          <div className="grid" style={{ gridTemplateColumns: gridTemplate, minWidth }}>
            <div className="border-divider dark:border-divider-dark h-8 border-r" />
            {dayKeys.map((_, index) => (
              <div className="border-divider dark:border-divider-dark h-8 border-r p-1" key={index} />
            ))}
          </div>
        </summary>
      </details>
      <div className="col-start-1 row-start-3 grid" style={{ gridTemplateColumns: gridTemplate, minWidth }}>
        <div className="border-divider dark:border-divider-dark border-r">
          {HOURS.map(hour => (
            <div
              className={cn(
                'relative h-[72px] pr-3 text-right',
                hour === 0 && 'border-divider dark:border-divider-dark border-t',
              )}
              key={hour}
            >
              <span className="text-muted absolute top-1.5 right-3 text-xs tabular-nums">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>
        {dayKeys.map((_, dayIndex) => (
          <div
            className="border-divider dark:border-divider-dark relative border-r"
            key={dayIndex}
            style={{ height: GRID_HEIGHT }}
          >
            {HOURS.map(hour => (
              <div
                className={cn(
                  'border-divider/60 dark:border-divider-dark/60 h-[72px] border-b',
                  hour === 0 && 'border-t',
                )}
                key={hour}
              />
            ))}
          </div>
        ))}
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
