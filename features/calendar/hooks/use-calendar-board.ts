'use client';

import * as Ariakit from '@ariakit/react';
import { useOptimistic, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { moveEvent, resizeEvent } from '../calendar-actions';
import { dateKey, timeToMinutes } from '../calendar-utils';
import { useCalendarVisibility } from '../components/calendar-visibility';
import { applyEventAction } from '../utils/event-optimistic-reducer';
import {
  END_MINUTES,
  HOUR_HEIGHT,
  minutesToTime,
  nearestDuration,
  SNAP_MINUTES,
  snapMinutes,
  START_HOUR,
} from '../utils/grid';
import { useNow } from './use-now';
import type { Calendar, CalendarColor, CalendarEvent, CalendarView } from '../types/calendar';
import type { EventAction } from '../utils/event-optimistic-reducer';

type MoveOrigin = {
  duration: number;
  grabOffsetMin: number;
  id: string;
  moved: boolean;
  sourceId: string;
  x0: number;
  y0: number;
};

export type SelectedEvent = { anchorRect?: DOMRect | null; event: CalendarEvent };
export type CalendarBoardInteractions = {
  create: {
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerDown: (day: string, event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (day: string, event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (day: string, event: React.PointerEvent<HTMLDivElement>) => void;
  };
  dragMove: { day: string; id: string; startMin: number } | null;
  getSelection: (day: string) => { hi: number; lo: number } | null;
  move: {
    onPointerCancel: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerDown: (event: CalendarEvent, pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
  };
  onEventSelect: (event: CalendarEvent, anchorRect: DOMRect) => void;
  resize: { endMin: number; sourceId: string; startMin: number } | null;
  resizeHandlers: {
    onPointerDown: (event: CalendarEvent, pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
  };
  selectionColor: CalendarColor;
};

export function useCalendarBoard({
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
  const [optimisticEvents, addOptimisticEvent] = useOptimistic(events, applyEventAction);
  const [isPending, startTransition] = useTransition();
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const [dragMove, setDragMove] = useState<{ day: string; id: string; startMin: number } | null>(null);
  const [resize, setResize] = useState<{ endMin: number; sourceId: string; startMin: number } | null>(null);
  const [createSel, setCreateSel] = useState<{ aMin: number; bMin: number; day: string } | null>(null);
  const [createDraft, setCreateDraft] = useState<{
    allDay?: boolean;
    anchorRect?: DOMRect | null;
    day: string;
    duration: number;
    start: string;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<MoveOrigin | null>(null);
  const resizeColTopRef = useRef(0);
  const dragMoveRef = useRef<{ day: string; id: string; startMin: number } | null>(null);
  const createRef = useRef<{ aMin: number; day: string; pointerId: number } | null>(null);
  const suppressClickRef = useRef(false);
  const createStore = Ariakit.usePopoverStore({
    placement: 'top-start',
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
  const defaultCalendar = writable[0] ?? calendars[0];
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

  function targetMoveFromPointer(origin: MoveOrigin, pointerEvent: React.PointerEvent<HTMLElement>) {
    const day = days[pointToDayIndex(pointerEvent.clientX)];
    const raw = pointToMinutes(pointerEvent.clientY) - origin.grabOffsetMin;
    const snapped = Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES;
    const startMin = Math.max(START_HOUR * 60, Math.min(END_MINUTES - origin.duration, snapped));
    return { day, id: origin.id, startMin };
  }

  function handleMoveMove(pointerEvent: React.PointerEvent<HTMLElement>) {
    const origin = moveRef.current;
    if (!origin) return;
    if (!origin.moved) {
      if (Math.abs(pointerEvent.clientX - origin.x0) < 4 && Math.abs(pointerEvent.clientY - origin.y0) < 4) return;
      origin.moved = true;
    }
    const target = targetMoveFromPointer(origin, pointerEvent);
    dragMoveRef.current = target;
    setDragMove(target);
  }

  function handleMoveUp(pointerEvent: React.PointerEvent<HTMLElement>) {
    const origin = moveRef.current;
    moveRef.current = null;
    try {
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId);
    } catch {}
    const target = origin?.moved ? targetMoveFromPointer(origin, pointerEvent) : dragMoveRef.current;
    dragMoveRef.current = null;
    setDragMove(null);
    if (!origin || !origin.moved || !target) return;
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 120);
    const start = minutesToTime(target.startMin);
    const { day, id } = target;
    const sourceId = origin.sourceId;
    startTransition(async () => {
      addOptimisticEvent({ day, id, start, type: 'move' });
      const result = await moveEvent({ day, sourceId, start });
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  function handleMoveCancel() {
    moveRef.current = null;
    dragMoveRef.current = null;
    setDragMove(null);
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
      addOptimisticEvent({ duration, sourceId, type: 'resize' });
      const result = await resizeEvent({ duration, sourceId });
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  function handleCreateDown(day: string, event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest('[data-event-chip]')) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const minutes = snapMinutes(event.clientY, bounds.top);
    event.currentTarget.setPointerCapture(event.pointerId);
    createRef.current = { aMin: minutes, day, pointerId: event.pointerId };
    setCreateSel({ aMin: minutes, bMin: minutes, day });
  }

  function handleCreateMove(day: string, event: React.PointerEvent<HTMLDivElement>) {
    const active = createRef.current;
    if (!active || active.day !== day || active.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setCreateSel({ aMin: active.aMin, bMin: snapMinutes(event.clientY, bounds.top), day });
  }

  function handleCreateUp(day: string, event: React.PointerEvent<HTMLDivElement>) {
    const active = createRef.current;
    if (!active || active.day !== day || active.pointerId !== event.pointerId) return;
    createRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
    const bounds = event.currentTarget.getBoundingClientRect();
    const releasedMin = snapMinutes(event.clientY, bounds.top);
    const lo = Math.min(active.aMin, releasedMin);
    const hi = Math.max(active.aMin, releasedMin);
    const duration = hi - lo >= SNAP_MINUTES ? nearestDuration(hi - lo) : 15;
    const startMin = Math.min(lo, END_MINUTES - duration);
    setCreateSel({ aMin: startMin, bMin: startMin + duration, day });
    setCreateDraft({
      anchorRect: new DOMRect(event.clientX, event.clientY, 0, 0),
      day,
      duration,
      start: minutesToTime(startMin),
    });
    createStore.show();
  }

  function handleCreateCancel(event: React.PointerEvent<HTMLDivElement>) {
    if (createRef.current?.pointerId !== event.pointerId) return;
    createRef.current = null;
    setCreateSel(null);
  }

  function handleAllDayCreate(day: string, event: React.MouseEvent<HTMLElement>) {
    setCreateSel(null);
    setCreateDraft({
      allDay: true,
      anchorRect: event.currentTarget.getBoundingClientRect(),
      day,
      duration: 24 * 60,
      start: '00:00',
    });
    createStore.show();
  }

  function handleEventSelect(event: CalendarEvent, anchorRect: DOMRect) {
    if (suppressClickRef.current) return;
    setSelectedEvent({ anchorRect, event });
  }

  const interactions: CalendarBoardInteractions = {
    create: {
      onPointerCancel: handleCreateCancel,
      onPointerDown: handleCreateDown,
      onPointerMove: handleCreateMove,
      onPointerUp: handleCreateUp,
    },
    dragMove,
    getSelection(day: string) {
      if (createSel?.day !== day) return null;
      return {
        hi: Math.max(createSel.aMin, createSel.bMin),
        lo: Math.min(createSel.aMin, createSel.bMin),
      };
    },
    move: {
      onPointerCancel: handleMoveCancel,
      onPointerDown: handleMoveDown,
      onPointerMove: handleMoveMove,
      onPointerUp: handleMoveUp,
    },
    onEventSelect: handleEventSelect,
    resize,
    resizeHandlers: {
      onPointerDown: handleResizeDown,
      onPointerMove: handleResizeMove,
      onPointerUp: handleResizeUp,
    },
    selectionColor: defaultCalendar?.color ?? 'blue',
  };

  return {
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
    addOptimisticEvent: (action: EventAction) => startTransition(() => addOptimisticEvent(action)),
    setSelectedEvent,
    todayKey,
    visibleEvents,
  };
}
