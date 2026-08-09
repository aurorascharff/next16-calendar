'use client';

import { useLayoutEffect, useRef } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useCalendarBoard } from '../hooks/use-calendar-board';
import { DEFAULT_SCROLL_TOP, GRID_HEIGHT, HOURS } from '../utils/grid';
import { CalendarAllDayRow, CalendarDayHeaderRow } from './calendar-board-rows';
import { DayColumn } from './calendar-day-column';
import { EventCreateDialog } from './event-create-dialog';
import { EventEditor } from './event-editor';
import type { Calendar, CalendarEvent, CalendarView } from '../types/calendar';

export function CalendarBoard({
  calendars,
  days,
  events,
  view,
}: {
  calendars: Calendar[];
  days: string[];
  events: CalendarEvent[];
  view: CalendarView;
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
    handleAllDayCreate,
    interactions,
    isPending,
    nowMinutes,
    selectedEvent,
    setOptimisticEvents,
    setSelectedEvent,
    todayKey,
    visibleEvents,
  } = useCalendarBoard({ calendars, days, events, view });
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollKey = `${view}:${days.join(',')}`;

  useLayoutEffect(() => {
    const scrollContainer = rootRef.current?.closest('[data-calendar-scroll]');
    if (scrollContainer instanceof HTMLElement) {
      scrollContainer.scrollTop = DEFAULT_SCROLL_TOP;
    }
  }, [scrollKey]);

  return (
    <div className="relative select-none" ref={rootRef}>
      {isPending ? (
        <div
          aria-label="Saving calendar changes"
          className="border-divider bg-surface/90 text-accent shadow-soft dark:border-divider-dark dark:bg-surface-dark/90 pointer-events-none absolute top-3 right-4 z-40 grid size-8 place-items-center rounded-full border"
          role="status"
        >
          <Spinner className="size-4" />
        </div>
      ) : null}
      <CalendarDayHeaderRow
        days={days}
        gridMinWidth={gridMinWidth}
        gridTemplate={gridTemplate}
        todayKey={todayKey}
      />
      <CalendarAllDayRow
        days={days}
        events={allDayEvents}
        getEffectiveDay={effectiveDay}
        gridMinWidth={gridMinWidth}
        gridTemplate={gridTemplate}
        onCreateAllDay={handleAllDayCreate}
        onSelectEvent={setSelectedEvent}
        todayKey={todayKey}
      />
      <div className="grid pt-3" ref={gridRef} style={{ gridTemplateColumns: gridTemplate, minWidth: gridMinWidth }}>
        <div className="border-divider dark:border-divider-dark border-r">
          {HOURS.map(hour => (
            <div className="relative h-[72px] pr-3 text-right" key={hour}>
              <span className="text-muted absolute -top-2 right-3 text-xs tabular-nums">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>
        {days.map(day => {
          const isToday = day === todayKey;
          const dayEvents = visibleEvents.filter(event => !event.allDay && effectiveDay(event) === day);
          return (
            <DayColumn
              day={day}
              events={dayEvents}
              interaction={interactions}
              isToday={isToday}
              key={day}
              nowMinutes={nowMinutes}
              showNow={isToday}
            />
          );
        })}
      </div>
      {selectedEvent ? (
        <EventEditor
          anchorRect={selectedEvent.anchorRect}
          event={selectedEvent.event}
          key={selectedEvent.event.id}
          onClose={() => setSelectedEvent(null)}
          onDeleted={sourceId => setOptimisticEvents({ sourceId, type: 'delete' })}
          onUpdated={event => setOptimisticEvents({ event, type: 'update' })}
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
          key={`${createDraft.day}-${createDraft.start}-${createDraft.duration}`}
          store={createStore}
        />
      ) : null}
    </div>
  );
}

export function CalendarBoardSkeleton({ days = 7 }: { days?: number }) {
  const gridTemplate = `4.5rem repeat(${days}, minmax(0, 1fr))`;
  const minWidth = days > 1 ? 760 : undefined;
  return (
    <div>
      <div
        className="border-divider dark:border-divider-dark grid border-b"
        style={{ gridTemplateColumns: gridTemplate, minWidth }}
      >
        <div />
        {Array.from({ length: days }).map((_, index) => (
          <div className="flex items-center gap-1.5 px-3 py-1.5" key={index}>
            <div className="skeleton-animation h-3 w-6 rounded" />
            <div className="skeleton-animation size-7 rounded-full" />
          </div>
        ))}
      </div>
      <div
        className="border-divider dark:border-divider-dark bg-surface/70 dark:bg-surface-dark/70 grid border-b"
        style={{ gridTemplateColumns: gridTemplate, minWidth }}
      >
        <div className="border-divider dark:border-divider-dark text-muted flex items-center justify-end border-r px-3 py-1.5 text-[11px] font-medium">
          All day
        </div>
        {Array.from({ length: days }).map((_, index) => (
          <div className="border-divider dark:border-divider-dark min-h-9 border-r p-1" key={index} />
        ))}
      </div>
      <div className="grid pt-3" style={{ gridTemplateColumns: gridTemplate, minWidth }}>
        <div className="border-divider dark:border-divider-dark border-r">
          {HOURS.map(hour => (
            <div className="relative h-[72px] pr-3 text-right" key={hour}>
              <span className="text-muted absolute -top-2 right-3 text-xs tabular-nums">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>
        {Array.from({ length: days }).map((_, dayIndex) => (
          <div
            className="border-divider dark:border-divider-dark border-r"
            key={dayIndex}
            style={{ height: GRID_HEIGHT }}
          >
            {HOURS.map(hour => (
              <div className="border-divider/60 dark:border-divider-dark/60 h-[72px] border-b" key={hour} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
