'use client';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { formatDay } from '../calendar-utils';
import { useCalendarBoard } from '../hooks/use-calendar-board';
import { GRID_HEIGHT, HOURS } from '../utils/grid';
import { CalendarAllDayRow, CalendarDayHeaderRow } from './calendar-board-rows';
import { DayColumn } from './calendar-day-column';
import { EventCreateDialog } from './event-create-dialog';
import { EventEditor } from './event-editor';
import type { Calendar, CalendarEvent, CalendarView } from '../types/calendar';

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function matchesRecurrence(recurrence: string | null | undefined, day: string) {
  if (!recurrence) return false;
  const weekday = new Date(`${day}T00:00:00.000Z`).getUTCDay();
  return recurrence === 'weekday' ? weekday >= 1 && weekday <= 5 : recurrence === WEEKDAY_NAMES[weekday];
}

function optimisticCreatedEvents(event: CalendarEvent, days: string[]) {
  if (!event.recurrence) return [event];

  return days
    .filter(day => matchesRecurrence(event.recurrence, day))
    .map(day => ({
      ...event,
      day,
      id: `${event.sourceId}:${day}`,
      recurring: true,
    }));
}

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
    addOptimisticEvent,
    setSelectedEvent,
    todayKey,
    visibleEvents,
  } = useCalendarBoard({ calendars, days, events, view });

  return (
    <div className="relative select-none">
      {isPending ? (
        <div
          aria-label="Saving calendar changes"
          className="border-divider bg-surface/90 text-accent shadow-soft dark:border-divider-dark dark:bg-surface-dark/90 pointer-events-none absolute top-3 right-4 z-40 grid size-8 place-items-center rounded-full border"
          role="status"
        >
          <Spinner className="size-4" />
        </div>
      ) : null}
      <div className="sticky top-0 z-30" style={{ minWidth: gridMinWidth }}>
        <CalendarDayHeaderRow days={days} gridTemplate={gridTemplate} todayKey={todayKey} />
        <CalendarAllDayRow
          days={days}
          events={allDayEvents}
          getEffectiveDay={effectiveDay}
          gridTemplate={gridTemplate}
          onCreateAllDay={handleAllDayCreate}
          onSelectEvent={setSelectedEvent}
          todayKey={todayKey}
        />
      </div>
      <div className="grid" ref={gridRef} style={{ gridTemplateColumns: gridTemplate, minWidth: gridMinWidth }}>
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
            for (const createdEvent of optimisticCreatedEvents(event, days)) {
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
              <div
                className="border-divider dark:border-divider-dark flex items-center gap-1.5 border-r px-3 py-1.5 text-left"
                key={index}
              >
                {day ? (
                  <>
                    <span className="text-muted text-[11px] font-medium uppercase">{weekday}</span>
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-base font-semibold tabular-nums">
                      {dayNumber}
                    </span>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
        <div
          className="border-divider dark:border-divider-dark bg-surface dark:bg-surface-dark grid border-b"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className="border-divider dark:border-divider-dark text-muted flex items-center justify-end border-r px-3 py-1.5 text-[11px] font-medium">
            All day
          </div>
          {dayKeys.map((_, index) => (
            <div className="border-divider dark:border-divider-dark min-h-9 border-r p-1" key={index} />
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
