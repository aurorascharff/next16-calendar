'use client';

import * as Ariakit from '@ariakit/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Crossfade } from '@/components/ui/crossfade';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { useCalendarEvents } from '@/providers/calendar-events-provider';
import { formatDay, formatDayParts, shiftDay } from '../calendar-utils';
import { useCalendarBoard } from '../hooks/use-calendar-board';
import { useTodayKey } from '../hooks/use-now';
import { GRID_HEIGHT, HOURS, START_MINUTES } from '../utils/grid';
import { CalendarBoardHeader } from './calendar-board-header';
import { CalendarEventLayer, DayColumn } from './calendar-day-column';
import { EventCreateDialog } from './event-create-dialog';
import { EventPopover } from './event-popover';
import type { Calendar, CalendarEvent } from '../types/calendar';
import type { ReactNode } from 'react';

export function CalendarBoard({
  calendars,
  days,
  events,
}: {
  calendars: Calendar[];
  days: string[];
  events: CalendarEvent[];
}) {
  const { getEvents } = useCalendarEvents();
  const eventDays = [...days, shiftDay(days.at(-1)!, 1)];
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
    nowMinutes,
    selectedEvent,
    setSelectedEvent,
    todayKey,
    visibleEvents,
  } = useCalendarBoard({
    calendars,
    days,
    events: getEvents(events, eventDays),
  });

  const currentGridDay = todayKey && nowMinutes < START_MINUTES ? shiftDay(todayKey, -1) : todayKey;

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
          onLostPointerCapture={interactions.move.onLostPointerCapture}
          onPointerCancel={interactions.move.onPointerCancel}
          onPointerMove={interactions.move.onPointerMove}
          onPointerUp={interactions.move.onPointerUp}
          ref={gridRef}
          style={{ gridTemplateColumns: gridTemplate, minWidth: gridMinWidth }}
        >
          <div />
          {days.map(day => {
            const isToday = day === currentGridDay;
            return (
              <DayColumn
                day={day}
                interaction={interactions}
                isToday={isToday}
                key={day}
                nowMinutes={nowMinutes}
                renderGrid={isToday}
                showNow={isToday}
              />
            );
          })}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 left-[var(--calendar-time-column-width)] z-10 grid"
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
      {selectedEvent ? (
        <EventPopover
          anchorRect={selectedEvent.anchorRect}
          calendar={calendars.find(calendar => calendar.id === selectedEvent.event.calendarId)}
          event={selectedEvent.event}
          key={selectedEvent.event.id}
          onClose={() => setSelectedEvent(null)}
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
  const gridTemplate = `var(--calendar-time-column-width) repeat(${dayKeys.length}, minmax(var(--calendar-day-column-min-width), 1fr))`;
  const minWidth = dayKeys.length > 1 ? 'var(--calendar-grid-min-width)' : undefined;
  return (
    <div className="relative grid [grid-template-rows:auto_auto_auto] select-none [--calendar-day-column-min-width:2.5rem] [--calendar-grid-min-width:20rem] [--calendar-time-column-width:2.5rem] sm:[--calendar-day-column-min-width:9rem] sm:[--calendar-grid-min-width:67.5rem] sm:[--calendar-time-column-width:4.5rem]">
      <div className="sticky top-0 z-30 col-start-1 row-start-1" style={{ minWidth }}>
        <div
          className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark grid border-b"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className="border-divider dark:border-divider-dark border-r" />
          {dayKeys.map((day, index) => {
            const { day: dayNumber, weekday } = day ? formatDayParts(day) : { day: '', weekday: '' };
            const isToday = day === todayKey;
            return (
              <div
                className={cn(
                  'border-divider dark:border-divider-dark h-12 border-r px-0.5 py-1.5 sm:h-10 sm:px-3',
                  isToday && 'bg-action/[0.07] dark:bg-action/10',
                )}
                key={index}
              >
                {day ? (
                  <div className="flex min-w-0 flex-col items-center justify-center gap-0.5 sm:flex-row sm:justify-start sm:gap-1.5">
                    <span
                      className={cn(
                        'text-[9px] leading-none font-medium uppercase sm:text-[11px] sm:leading-normal',
                        isToday ? 'text-black dark:text-white' : 'text-muted',
                      )}
                    >
                      {weekday}
                    </span>
                    <span
                      className={cn(
                        'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold tabular-nums sm:h-7 sm:min-w-7 sm:px-1.5 sm:text-base',
                        isToday && 'bg-action text-white',
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
                  <div className="flex min-w-0 items-center justify-center gap-1.5 sm:justify-start" aria-hidden>
                    <span className="bg-divider/60 dark:bg-divider-dark hidden h-2 w-7 rounded-full sm:block" />
                    <span className="skeleton-animation size-5 shrink-0 rounded-full sm:size-7" />
                    <span className="ml-auto hidden size-8 sm:block" />
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
                'relative h-[72px] pr-1 text-right sm:pr-3',
                hour === 0 && 'border-divider dark:border-divider-dark border-t',
              )}
              key={hour}
            >
              <span className="text-muted absolute top-1.5 right-1 text-[10px] tabular-nums sm:right-3 sm:text-xs">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>
        {dayKeys.map((day, dayIndex) => (
          <div
            className="border-divider dark:border-divider-dark relative border-r"
            key={dayIndex}
            style={{ height: GRID_HEIGHT }}
          >
            {HOURS.map(hour => {
              const nextDay = day && hour === 0 ? shiftDay(day, 1) : null;
              const nextDayParts = nextDay ? formatDayParts(nextDay) : null;

              return (
                <div
                  className={cn(
                    'border-divider/60 dark:border-divider-dark/60 relative h-[72px] border-b',
                    hour === 0 && 'border-divider dark:border-divider-dark border-t',
                  )}
                  key={hour}
                >
                  {nextDayParts ? (
                    <span
                      aria-label={`Next day, ${formatDay(nextDay!)}`}
                      className="border-divider bg-surface text-muted dark:border-divider-dark dark:bg-surface-dark absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border px-1.5 py-0.5 text-[9px] leading-none font-semibold whitespace-nowrap uppercase sm:px-2 sm:text-[10px]"
                    >
                      <span className="hidden sm:inline">{nextDayParts.weekday} </span>
                      {nextDayParts.day}
                    </span>
                  ) : null}
                </div>
              );
            })}
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
