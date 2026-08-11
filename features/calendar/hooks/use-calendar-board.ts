'use client';

import * as Ariakit from '@ariakit/react';
import { useEffect, useRef, useState } from 'react';
import { useCalendarEvents } from '@/providers/calendar-events-provider';
import { useCalendarVisibility } from '@/providers/calendar-visibility-provider';
import { dateKey } from '../calendar-utils';
import {
  calendarDayFromGridDay,
  END_MINUTES,
  eventStartMinutes,
  gridDayFromCalendarDay,
  HOUR_HEIGHT,
  minutesToTime,
  nearestDuration,
  SNAP_MINUTES,
  snapMinutes,
  START_MINUTES,
  TIME_COLUMN_WIDTH,
} from '../utils/grid';
import { useNow } from './use-now';
import type { Calendar, CalendarColor, CalendarEvent } from '../types/calendar';

type MoveOrigin = {
  active: boolean;
  day: string;
  duration: number;
  grabOffsetMin: number;
  id: string;
  moved: boolean;
  pointerId: number;
  sourceId: string;
  start: string;
  x0: number;
  y0: number;
};

type CreateOrigin = {
  aMin: number;
  day: string;
  pointerId: number;
  x0: number;
  y0: number;
};

type ResizeTarget = { endMin: number; sourceId: string; startMin: number };
type ResizeOrigin = ResizeTarget & { initialDuration: number; pointerId: number };

export type SelectedEvent = { anchorRect?: DOMRect | null; event: CalendarEvent };
export type CalendarBoardInteractions = {
  create: {
    onLostPointerCapture: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerDown: (day: string, event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (day: string, event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (day: string, event: React.PointerEvent<HTMLDivElement>) => void;
  };
  dragMove: { day: string; id: string; startMin: number } | null;
  getSelection: (day: string) => { hi: number; lo: number } | null;
  move: {
    onLostPointerCapture: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerDown: (event: CalendarEvent, pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
  };
  onEventSelect: (event: CalendarEvent, anchorRect: DOMRect) => void;
  resize: { endMin: number; sourceId: string; startMin: number } | null;
  resizeHandlers: {
    onLostPointerCapture: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerDown: (event: CalendarEvent, pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (pointerEvent: React.PointerEvent<HTMLElement>) => void;
  };
  selectionColor: CalendarColor;
};

const TOUCH_HOLD_MS = 450;
const TOUCH_SLOP_PX = 10;

export function useCalendarBoard({
  calendars,
  days,
  events,
}: {
  calendars: Calendar[];
  days: string[];
  events: CalendarEvent[];
}) {
  const { mutate } = useCalendarEvents();
  const { hidden } = useCalendarVisibility();
  const gridTemplate = `var(--calendar-time-column-width) repeat(${days.length}, minmax(var(--calendar-day-column-min-width), 1fr))`;
  const gridMinWidth = days.length > 1 ? 'var(--calendar-grid-min-width)' : undefined;
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const [dragMove, setDragMove] = useState<{ day: string; id: string; startMin: number } | null>(null);
  const [resize, setResize] = useState<ResizeTarget | null>(null);
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
  const moveHoldRef = useRef<number | null>(null);
  const resizeRef = useRef<ResizeOrigin | null>(null);
  const resizeColTopRef = useRef(0);
  const dragMoveRef = useRef<{ day: string; id: string; startMin: number } | null>(null);
  const createRef = useRef<CreateOrigin | null>(null);
  const createHoldRef = useRef<number | null>(null);
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
  const createOpen = createStore.useState('open');
  const now = useNow();
  const todayKey = now ? dateKey(now) : null;
  const nowMinutes = now ? now.getHours() * 60 + now.getMinutes() : 0;
  const defaultCalendar = calendars[0];
  const visibleEvents = events.filter(event => !hidden.has(event.calendarId));
  const allDayEvents = visibleEvents.filter(event => event.allDay);

  useEffect(
    () => () => {
      if (moveHoldRef.current !== null) window.clearTimeout(moveHoldRef.current);
      if (createHoldRef.current !== null) window.clearTimeout(createHoldRef.current);
    },
    [],
  );

  function clearMoveHold() {
    if (moveHoldRef.current === null) return;
    window.clearTimeout(moveHoldRef.current);
    moveHoldRef.current = null;
  }

  function clearCreateHold() {
    if (createHoldRef.current === null) return;
    window.clearTimeout(createHoldRef.current);
    createHoldRef.current = null;
  }

  function pointToDayIndex(clientX: number) {
    const grid = gridRef.current;
    if (!grid) return 0;
    const rect = grid.getBoundingClientRect();
    const gutter = grid.firstElementChild?.getBoundingClientRect().width ?? TIME_COLUMN_WIDTH;
    const colWidth = (rect.width - gutter) / days.length;
    return Math.max(0, Math.min(days.length - 1, Math.floor((clientX - rect.left - gutter) / colWidth)));
  }

  function pointToMinutes(clientY: number) {
    const grid = gridRef.current;
    if (!grid) return START_MINUTES;
    const rect = grid.getBoundingClientRect();
    return START_MINUTES + ((clientY - rect.top - 12) / HOUR_HEIGHT) * 60;
  }

  function effectiveDay(event: CalendarEvent) {
    if (event.allDay) return event.day;
    if (dragMove?.id === event.id) return gridDayFromCalendarDay(dragMove.day, dragMove.startMin);
    return gridDayFromCalendarDay(event.day, eventStartMinutes(event.start));
  }

  function handleMoveDown(calendarEvent: CalendarEvent, pointerEvent: React.PointerEvent<HTMLElement>) {
    if (pointerEvent.button !== 0) return;
    if ((pointerEvent.target as HTMLElement).closest('[data-resize-handle]')) return;
    const touch = pointerEvent.pointerType === 'touch';
    if (touch && !(pointerEvent.target as HTMLElement).closest('[data-drag-handle]')) return;
    pointerEvent.stopPropagation();
    const captureTarget = gridRef.current ?? pointerEvent.currentTarget;
    const origin: MoveOrigin = {
      active: !touch,
      day: calendarEvent.day,
      duration: calendarEvent.duration,
      grabOffsetMin: pointToMinutes(pointerEvent.clientY) - eventStartMinutes(calendarEvent.start),
      id: calendarEvent.id,
      moved: false,
      pointerId: pointerEvent.pointerId,
      sourceId: calendarEvent.sourceId,
      start: calendarEvent.start,
      x0: pointerEvent.clientX,
      y0: pointerEvent.clientY,
    };
    moveRef.current = origin;

    if (!touch) {
      captureTarget.setPointerCapture(pointerEvent.pointerId);
      return;
    }

    clearMoveHold();
    moveHoldRef.current = window.setTimeout(() => {
      const pending = moveRef.current;
      if (!pending || pending.pointerId !== pointerEvent.pointerId) return;
      pending.active = true;
      try {
        captureTarget.setPointerCapture(pointerEvent.pointerId);
      } catch {}
      const drag = { day: pending.day, id: pending.id, startMin: eventStartMinutes(pending.start) };
      dragMoveRef.current = drag;
      setDragMove(drag);
      moveHoldRef.current = null;
    }, TOUCH_HOLD_MS);
  }

  function targetMoveFromPointer(origin: MoveOrigin, pointerEvent: React.PointerEvent<HTMLElement>) {
    const gridDay = days[pointToDayIndex(pointerEvent.clientX)];
    const raw = pointToMinutes(pointerEvent.clientY) - origin.grabOffsetMin;
    const snapped = Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES;
    const startMin = Math.max(START_MINUTES, Math.min(END_MINUTES - origin.duration, snapped));
    return { day: calendarDayFromGridDay(gridDay, startMin), id: origin.id, startMin };
  }

  function handleMoveMove(pointerEvent: React.PointerEvent<HTMLElement>) {
    const origin = moveRef.current;
    if (!origin || origin.pointerId !== pointerEvent.pointerId) return;
    if (!origin.active) {
      if (
        Math.abs(pointerEvent.clientX - origin.x0) >= TOUCH_SLOP_PX ||
        Math.abs(pointerEvent.clientY - origin.y0) >= TOUCH_SLOP_PX
      ) {
        clearMoveHold();
        moveRef.current = null;
      }
      return;
    }
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
    clearMoveHold();
    if (!origin || origin.pointerId !== pointerEvent.pointerId) return;
    const heldOnTouch = pointerEvent.pointerType === 'touch' && origin.active;
    try {
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId);
    } catch {}
    if (!origin.moved) {
      origin.moved = Math.abs(pointerEvent.clientX - origin.x0) >= 4 || Math.abs(pointerEvent.clientY - origin.y0) >= 4;
    }
    const target = origin.moved ? (dragMoveRef.current ?? targetMoveFromPointer(origin, pointerEvent)) : null;
    dragMoveRef.current = null;
    setDragMove(null);
    if (heldOnTouch || origin.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 120);
    }
    if (!origin.active || !origin.moved || !target) return;
    const start = minutesToTime(target.startMin);
    const { day, id } = target;
    if (day === origin.day && start === origin.start) return;
    const sourceId = origin.sourceId;
    void mutate({ day, id, sourceId, start, type: 'move' });
  }

  function handleMoveCancel() {
    clearMoveHold();
    moveRef.current = null;
    dragMoveRef.current = null;
    setDragMove(null);
  }

  function handleResizeDown(event: CalendarEvent, pointerEvent: React.PointerEvent<HTMLElement>) {
    if (pointerEvent.button !== 0) return;
    pointerEvent.stopPropagation();
    pointerEvent.preventDefault();
    const column = (pointerEvent.currentTarget as HTMLElement).closest('[data-day-column]');
    resizeColTopRef.current = column ? column.getBoundingClientRect().top : 0;
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
    const startMin = eventStartMinutes(event.start);
    const next = {
      endMin: startMin + event.duration,
      initialDuration: event.duration,
      pointerId: pointerEvent.pointerId,
      sourceId: event.sourceId,
      startMin,
    };
    resizeRef.current = next;
    setResize(next);
  }

  function targetResizeFromPointer(active: ResizeOrigin, pointerEvent: React.PointerEvent<HTMLElement>) {
    const raw = snapMinutes(pointerEvent.clientY, resizeColTopRef.current);
    return { ...active, endMin: Math.max(active.startMin + SNAP_MINUTES, raw) };
  }

  function handleResizeMove(pointerEvent: React.PointerEvent<HTMLElement>) {
    const active = resizeRef.current;
    if (!active || active.pointerId !== pointerEvent.pointerId) return;
    pointerEvent.stopPropagation();
    const next = targetResizeFromPointer(active, pointerEvent);
    resizeRef.current = next;
    setResize(next);
  }

  function handleResizeUp(pointerEvent: React.PointerEvent<HTMLElement>) {
    const active = resizeRef.current;
    if (!active || active.pointerId !== pointerEvent.pointerId) return;
    pointerEvent.stopPropagation();
    const target = targetResizeFromPointer(active, pointerEvent);
    resizeRef.current = null;
    try {
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId);
    } catch {}
    setResize(null);
    const duration = target.endMin - target.startMin;
    if (duration === target.initialDuration) return;
    const sourceId = target.sourceId;
    void mutate({ duration, sourceId, type: 'resize' });
  }

  function handleResizeCancel(pointerEvent: React.PointerEvent<HTMLElement>) {
    if (resizeRef.current?.pointerId !== pointerEvent.pointerId) return;
    pointerEvent.stopPropagation();
    resizeRef.current = null;
    setResize(null);
  }

  function handleCreateDown(day: string, event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest('[data-event-chip]')) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const minutes = snapMinutes(event.clientY, bounds.top);
    const target = event.currentTarget;
    createRef.current = {
      aMin: minutes,
      day,
      pointerId: event.pointerId,
      x0: event.clientX,
      y0: event.clientY,
    };

    if (event.pointerType !== 'touch') {
      target.setPointerCapture(event.pointerId);
      setCreateSel({ aMin: minutes, bMin: minutes, day });
      return;
    }

    clearCreateHold();
    createHoldRef.current = window.setTimeout(() => {
      const pending = createRef.current;
      if (!pending || pending.pointerId !== event.pointerId) return;
      createRef.current = null;
      createHoldRef.current = null;
      const duration = 30;
      const startMin = Math.min(pending.aMin, END_MINUTES - duration);
      setCreateSel({ aMin: startMin, bMin: startMin + duration, day });
      setCreateDraft({
        anchorRect: new DOMRect(pending.x0, pending.y0, 0, 0),
        day: calendarDayFromGridDay(day, startMin),
        duration,
        start: minutesToTime(startMin),
      });
      createStore.show();
    }, TOUCH_HOLD_MS);
  }

  function handleCreateMove(day: string, event: React.PointerEvent<HTMLDivElement>) {
    const active = createRef.current;
    if (!active || active.day !== day || active.pointerId !== event.pointerId) return;
    if (event.pointerType === 'touch') {
      if (
        Math.abs(event.clientX - active.x0) >= TOUCH_SLOP_PX ||
        Math.abs(event.clientY - active.y0) >= TOUCH_SLOP_PX
      ) {
        clearCreateHold();
        createRef.current = null;
      }
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    setCreateSel({ aMin: active.aMin, bMin: snapMinutes(event.clientY, bounds.top), day });
  }

  function handleCreateUp(day: string, event: React.PointerEvent<HTMLDivElement>) {
    const active = createRef.current;
    if (!active || active.day !== day || active.pointerId !== event.pointerId) return;
    createRef.current = null;
    clearCreateHold();
    if (event.pointerType === 'touch') return;
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
      day: calendarDayFromGridDay(day, startMin),
      duration,
      start: minutesToTime(startMin),
    });
    createStore.show();
  }

  function handleCreateCancel(event: React.PointerEvent<HTMLDivElement>) {
    if (createRef.current?.pointerId !== event.pointerId) return;
    clearCreateHold();
    createRef.current = null;
    setCreateSel(null);
  }

  function handleEventSelect(event: CalendarEvent, anchorRect: DOMRect) {
    if (suppressClickRef.current) return;
    setSelectedEvent({ anchorRect, event });
  }

  const interactions: CalendarBoardInteractions = {
    create: {
      onLostPointerCapture: handleCreateCancel,
      onPointerCancel: handleCreateCancel,
      onPointerDown: handleCreateDown,
      onPointerMove: handleCreateMove,
      onPointerUp: handleCreateUp,
    },
    dragMove,
    getSelection(day: string) {
      if ((!createOpen && !createRef.current) || createSel?.day !== day) return null;
      return {
        hi: Math.max(createSel.aMin, createSel.bMin),
        lo: Math.min(createSel.aMin, createSel.bMin),
      };
    },
    move: {
      onLostPointerCapture: handleMoveCancel,
      onPointerCancel: handleMoveCancel,
      onPointerDown: handleMoveDown,
      onPointerMove: handleMoveMove,
      onPointerUp: handleMoveUp,
    },
    onEventSelect: handleEventSelect,
    resize,
    resizeHandlers: {
      onLostPointerCapture: handleResizeCancel,
      onPointerCancel: handleResizeCancel,
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
    interactions,
    nowMinutes,
    selectedEvent,
    setSelectedEvent,
    todayKey,
    visibleEvents,
  };
}
