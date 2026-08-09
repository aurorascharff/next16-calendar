'use client';

import { cn } from '@/lib/utils';
import { formatDay } from '../calendar-utils';
import { useCalendarBoard } from '../hooks/use-calendar-board';
import { expandOptimisticEvent } from '../utils/event-optimistic-reducer';
import { GRID_HEIGHT, HOURS } from '../utils/grid';
import { CalendarAllDayRow } from './calendar-all-day-row';
import { CalendarDayHeaderRow } from './calendar-board-rows';
import { CalendarEventLayer, DayColumn } from './calendar-day-column';
import { EventCreateDialog } from './event-create-dialog';
import { EventPopover } from './event-popover';
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
    handleAllDayCreate,
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
    <div className="relative select-none">
      {isPending ? (
        <span className="sr-only" data-calendar-pending role="status">
          Saving calendar changes
        </span>
      ) : null}
      <div className="sticky top-0 z-30" style={{ minWidth: gridMinWidth }}>
        <CalendarDayHeaderRow
          days={days}
          gridTemplate={gridTemplate}
          onCreateAllDay={handleAllDayCreate}
          todayKey={todayKey}
        />
        <CalendarAllDayRow
          days={days}
          events={allDayEvents}
          getEffectiveDay={effectiveDay}
          gridTemplate={gridTemplate}
          onSelectEvent={setSelectedEvent}
          todayKey={todayKey}
        />
      </div>
      <div
        className="relative grid"
        ref={gridRef}
        style={{ gridTemplateColumns: gridTemplate, minWidth: gridMinWidth }}
      >
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
        {days.map(day => {
          const isToday = day === todayKey;
          return (
            <DayColumn
              day={day}
              interaction={interactions}
              isToday={isToday}
              key={day}
              nowMinutes={nowMinutes}
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
    </div>
  );
}

export function CalendarBoardSkeleton({ days, fallbackCount = 7 }: { days?: string[]; fallbackCount?: number }) {
  const dayKeys = days ?? Array.from({ length: fallbackCount }, () => null);
  const gridTemplate = `4.5rem repeat(${dayKeys.length}, minmax(0, 1fr))`;
  const minWidth = dayKeys.length > 1 ? 760 : undefined;
  return (
    <div className="relative">
      <div className="sticky top-0 z-30" style={{ minWidth }}>
        <div
          className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark grid border-b"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className="border-divider dark:border-divider-dark border-r" />
          {dayKeys.map((day, index) => {
            const [weekday, dayNumber] = day ? formatDay(day).split(' ') : ['', ''];
            return (
              <div className="border-divider dark:border-divider-dark border-r px-3 py-1.5" key={index}>
                {day ? (
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="text-muted text-[11px] font-medium uppercase">{weekday}</span>
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-base font-semibold tabular-nums">
                      {dayNumber}
                    </span>
                    <span className="ml-auto size-8" />
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
        <div
          className="border-divider dark:border-divider-dark bg-surface dark:bg-surface-dark grid border-b"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className="border-divider dark:border-divider-dark h-8 border-r" />
          {dayKeys.map((_, index) => (
            <div className="border-divider dark:border-divider-dark h-8 border-r p-1" key={index} />
          ))}
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: gridTemplate, minWidth }}>
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
    </div>
  );
}
