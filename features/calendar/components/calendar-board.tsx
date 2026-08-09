'use client';

import * as Ariakit from '@ariakit/react';
import { useOptimistic, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { moveEvent, resizeEvent } from '../calendar-actions';
import { dateKey, formatDay, timeToMinutes } from '../calendar-utils';
import { useNow } from '../hooks/use-now';
import { chipStyle } from '../utils/colors';
import {
  END_MINUTES,
  GRID_HEIGHT,
  HOUR_HEIGHT,
  HOURS,
  minutesToTime,
  nearestDuration,
  SNAP_MINUTES,
  snapMinutes,
  START_HOUR,
} from '../utils/grid';
import { DayColumn } from './calendar-day-column';
import { useCalendarVisibility } from './calendar-visibility';
import { EventCreateDialog } from './event-create-dialog';
import { EventEditor } from './event-editor';
import type { Calendar, CalendarEvent, CalendarView } from '../types/calendar';

type OptimisticAction =
  | { day: string; id: string; start: string; type: 'move' }
  | { sourceId: string; type: 'delete' }
  | { duration: number; sourceId: string; type: 'resize' }
  | { event: Pick<CalendarEvent, 'allDay' | 'duration' | 'sourceId' | 'start' | 'title'>; type: 'update' };

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
  const { hidden } = useCalendarVisibility();
  const gridTemplate = `4.5rem repeat(${days.length}, minmax(0, 1fr))`;
  const gridMinWidth = view === 'week' ? 760 : undefined;
  const [optimisticEvents, setOptimisticEvents] = useOptimistic(events, (current, next: OptimisticAction) => {
    if (next.type === 'delete') return current.filter(event => event.sourceId !== next.sourceId);
    if (next.type === 'resize')
      return current.map(event => (event.sourceId === next.sourceId ? { ...event, duration: next.duration } : event));
    if (next.type === 'update')
      return current.map(event => (event.sourceId === next.event.sourceId ? { ...event, ...next.event } : event));
    return current.map(event => (event.id === next.id ? { ...event, day: next.day, start: next.start } : event));
  });
  const [isPending, startTransition] = useTransition();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [dragMove, setDragMove] = useState<{ day: string; id: string; startMin: number } | null>(null);
  const [resize, setResize] = useState<{ endMin: number; sourceId: string; startMin: number } | null>(null);
  const [createSel, setCreateSel] = useState<{ aMin: number; bMin: number; day: string } | null>(null);
  const [createDraft, setCreateDraft] = useState<{ allDay?: boolean; day: string; duration: number; start: string } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<{
    duration: number;
    grabOffsetMin: number;
    id: string;
    moved: boolean;
    sourceId: string;
    x0: number;
    y0: number;
  } | null>(null);
  const resizeColTopRef = useRef(0);
  const suppressClickRef = useRef(false);
  const createStore = Ariakit.usePopoverStore({
    placement: 'bottom-start',
    setOpen(open) {
      if (!open) {
        setCreateDraft(null);
        setCreateSel(null);
      }
    },
  });
  const now = useNow();
  const todayKey = now ? dateKey(now) : null;
  const nowMinutes = now ? now.getHours() * 60 + now.getMinutes() : 0;

  const writable = calendars.filter(calendar => !calendar.isDemo);
  const defaultCalendar = writable.at(-1) ?? calendars.at(-1);
  const visibleEvents = optimisticEvents.filter(event => !hidden.has(event.calendarId));
  const allDayEvents = visibleEvents.filter(event => event.allDay);

  function pointToDayIndex(clientX: number) {
    const grid = gridRef.current;
    if (!grid) return 0;
    const rect = grid.getBoundingClientRect();
    const gutter = 72;
    const colWidth = (rect.width - gutter) / days.length;
    return Math.max(0, Math.min(days.length - 1, Math.floor((clientX - rect.left - gutter) / colWidth)));
  }

  function pointToMinutes(clientY: number) {
    const grid = gridRef.current;
    if (!grid) return START_HOUR * 60;
    const rect = grid.getBoundingClientRect();
    return START_HOUR * 60 + ((clientY - rect.top - 12) / HOUR_HEIGHT) * 60;
  }

  function effectiveDay(event: CalendarEvent) {
    return dragMove?.id === event.id ? dragMove.day : event.day;
  }

  function handleMoveDown(calendarEvent: CalendarEvent, pointerEvent: React.PointerEvent<HTMLElement>) {
    if (pointerEvent.button !== 0) return;
    if ((pointerEvent.target as HTMLElement).closest('[data-resize-handle]')) return;
    pointerEvent.stopPropagation();
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
    moveRef.current = {
      duration: calendarEvent.duration,
      grabOffsetMin: pointToMinutes(pointerEvent.clientY) - timeToMinutes(calendarEvent.start),
      id: calendarEvent.id,
      moved: false,
      sourceId: calendarEvent.sourceId,
      x0: pointerEvent.clientX,
      y0: pointerEvent.clientY,
    };
  }

  function handleMoveMove(pointerEvent: React.PointerEvent<HTMLElement>) {
    const origin = moveRef.current;
    if (!origin) return;
    if (!origin.moved) {
      if (Math.abs(pointerEvent.clientX - origin.x0) < 4 && Math.abs(pointerEvent.clientY - origin.y0) < 4) return;
      origin.moved = true;
    }
    const day = days[pointToDayIndex(pointerEvent.clientX)];
    const raw = pointToMinutes(pointerEvent.clientY) - origin.grabOffsetMin;
    const snapped = Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES;
    const startMin = Math.max(START_HOUR * 60, Math.min(END_MINUTES - origin.duration, snapped));
    setDragMove({ day, id: origin.id, startMin });
  }

  function handleMoveUp(pointerEvent: React.PointerEvent<HTMLElement>) {
    const origin = moveRef.current;
    moveRef.current = null;
    try {
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId);
    } catch {}
    const target = dragMove;
    setDragMove(null);
    if (!origin || !origin.moved || !target) return;
    suppressClickRef.current = true;
    requestAnimationFrame(() => {
      suppressClickRef.current = false;
    });
    const start = minutesToTime(target.startMin);
    const { day, id } = target;
    const sourceId = origin.sourceId;
    startTransition(async () => {
      setOptimisticEvents({ day, id, start, type: 'move' });
      const result = await moveEvent({ day, sourceId, start });
      if (result.error) toast.error(result.error);
    });
  }

  function handleResizeDown(event: CalendarEvent, pointerEvent: React.PointerEvent<HTMLElement>) {
    pointerEvent.stopPropagation();
    pointerEvent.preventDefault();
    const column = (pointerEvent.currentTarget as HTMLElement).closest('[data-day-column]');
    resizeColTopRef.current = column ? column.getBoundingClientRect().top : 0;
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
    const startMin = timeToMinutes(event.start);
    setResize({ endMin: startMin + event.duration, sourceId: event.sourceId, startMin });
  }

  function handleResizeMove(pointerEvent: React.PointerEvent<HTMLElement>) {
    if (!resize) return;
    const raw = snapMinutes(pointerEvent.clientY, resizeColTopRef.current);
    setResize(current => (current ? { ...current, endMin: Math.max(current.startMin + SNAP_MINUTES, raw) } : current));
  }

  function handleResizeUp(pointerEvent: React.PointerEvent<HTMLElement>) {
    if (!resize) return;
    try {
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId);
    } catch {}
    const duration = resize.endMin - resize.startMin;
    const sourceId = resize.sourceId;
    setResize(null);
    startTransition(async () => {
      setOptimisticEvents({ duration, sourceId, type: 'resize' });
      const result = await resizeEvent({ duration, sourceId });
      if (result.error) toast.error(result.error);
    });
  }

  function handleCreateDown(day: string, event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest('[data-event-chip]')) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const minutes = snapMinutes(event.clientY, bounds.top);
    event.currentTarget.setPointerCapture(event.pointerId);
    setCreateSel({ aMin: minutes, bMin: minutes, day });
  }

  function handleCreateMove(day: string, event: React.PointerEvent<HTMLDivElement>) {
    if (!createSel || createSel.day !== day) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setCreateSel(current => (current ? { ...current, bMin: snapMinutes(event.clientY, bounds.top) } : current));
  }

  function handleCreateUp(day: string, event: React.PointerEvent<HTMLDivElement>) {
    if (!createSel || createSel.day !== day) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
    const lo = Math.min(createSel.aMin, createSel.bMin);
    const hi = Math.max(createSel.aMin, createSel.bMin);
    const duration = hi - lo >= SNAP_MINUTES ? nearestDuration(hi - lo) : 60;
    setCreateSel({ aMin: lo, bMin: lo + duration, day });
    setCreateDraft({ day, duration, start: minutesToTime(Math.min(lo, END_MINUTES - 60)) });
    createStore.show();
  }

  function handleAllDayCreate(day: string) {
    setCreateSel(null);
    setCreateDraft({ allDay: true, day, duration: 24 * 60, start: '00:00' });
    createStore.show();
  }

  return (
    <div className="relative select-none">
      {isPending ? (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-40 h-0.5 overflow-hidden">
          <div className="bg-accent h-full w-1/3" style={{ animation: 'loading-slide 0.9s ease-in-out infinite' }} />
        </div>
      ) : null}
      <div
        className="border-divider bg-surface/90 dark:border-divider-dark dark:bg-surface-dark/90 sticky top-0 z-20 grid border-b backdrop-blur"
        style={{ gridTemplateColumns: gridTemplate, minWidth: gridMinWidth }}
      >
        <div />
        {days.map(day => {
          const [weekday, dayNumber] = formatDay(day).split(' ');
          const isToday = day === todayKey;
          return (
            <div className="flex items-center gap-1.5 px-3 py-1.5" key={day}>
              <p className={cn('text-[11px] font-medium uppercase', isToday ? 'text-accent' : 'text-muted')}>{weekday}</p>
              <p
                className={cn(
                  'inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-base font-semibold tabular-nums',
                  isToday && 'bg-accent text-white',
                )}
              >
                {dayNumber}
              </p>
            </div>
          );
        })}
      </div>
      <div
        className="border-divider dark:border-divider-dark grid border-b bg-surface/70 dark:bg-surface-dark/70"
        style={{ gridTemplateColumns: gridTemplate, minWidth: gridMinWidth }}
      >
        <div className="border-divider dark:border-divider-dark flex items-center justify-end border-r px-3 py-2 text-xs font-medium text-muted">
          All day
        </div>
        {days.map(day => {
          const dayEvents = allDayEvents.filter(event => effectiveDay(event) === day);
          return (
            <div className="min-h-12 border-r border-divider p-1.5 dark:border-divider-dark" key={day}>
              <button
                aria-label={`Add all-day event on ${formatDay(day)}`}
                className="flex min-h-8 w-full flex-col gap-1 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => handleAllDayCreate(day)}
                type="button"
              >
                {dayEvents.length ? (
                  dayEvents.map(event => (
                    <span
                      className="cal-chip flex min-w-0 items-center gap-1 rounded-[5px] px-2 py-1 text-xs font-semibold ring-1 ring-inset"
                      key={event.id}
                      onClick={click => {
                        click.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      style={chipStyle(event.color)}
                    >
                      <span className="truncate">{event.title}</span>
                    </span>
                  ))
                ) : (
                  <span className="sr-only">Create all-day event</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
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
              dragMove={dragMove}
              events={dayEvents}
              isToday={isToday}
              key={day}
              nowMinutes={nowMinutes}
              onCreateDown={handleCreateDown}
              onCreateMove={handleCreateMove}
              onCreateUp={handleCreateUp}
              onEventSelect={event => {
                if (suppressClickRef.current) return;
                setSelectedEvent(event);
              }}
              onMoveDown={handleMoveDown}
              onMoveMove={handleMoveMove}
              onMoveUp={handleMoveUp}
              onResizeDown={handleResizeDown}
              onResizeMove={handleResizeMove}
              onResizeUp={handleResizeUp}
              resize={resize}
              selectionColor={defaultCalendar?.color ?? 'blue'}
              selectionHi={createSel?.day === day ? Math.max(createSel.aMin, createSel.bMin) : null}
              selectionLo={createSel?.day === day ? Math.min(createSel.aMin, createSel.bMin) : null}
              showNow={isToday}
            />
          );
        })}
      </div>
      {selectedEvent ? (
        <EventEditor
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDeleted={sourceId => setOptimisticEvents({ sourceId, type: 'delete' })}
          onUpdated={event => setOptimisticEvents({ event, type: 'update' })}
        />
      ) : null}
      {createDraft ? (
        <EventCreateDialog
          calendars={calendars}
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
          <div className="px-3 py-2.5" key={index}>
            <div className="h-3" />
            <div className="mt-1 h-8" />
          </div>
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
