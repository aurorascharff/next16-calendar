'use client';

import { Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chipStyle } from '../utils/colors';
import type { CalendarEvent } from '../types/calendar';

type PointerHandler = (event: React.PointerEvent<HTMLElement>) => void;

function titleLineCount(height: number, hasTimeLabel: boolean) {
  const availableHeight = height - 12 - (hasTimeLabel ? 17 : 0);
  return Math.max(1, Math.floor(availableHeight / 15));
}

export function EventChip({
  event,
  height,
  isDragging,
  isResizing,
  left,
  onMoveDown,
  onMoveMove,
  onMoveUp,
  onMoveCancel,
  onResizeDown,
  onResizeMove,
  onResizeUp,
  onSelect,
  timeLabel,
  top,
  width,
}: {
  event: CalendarEvent;
  height: number;
  isDragging: boolean;
  isResizing: boolean;
  left: string;
  onMoveDown: PointerHandler;
  onMoveMove: PointerHandler;
  onMoveUp: PointerHandler;
  onMoveCancel: PointerHandler;
  onResizeDown: PointerHandler;
  onResizeMove: PointerHandler;
  onResizeUp: PointerHandler;
  onSelect: (anchorRect: DOMRect) => void;
  timeLabel: string | null;
  top: number;
  width: string;
}) {
  const titleLines = titleLineCount(height, Boolean(timeLabel));

  return (
    <button
      className={cn(
        'cal-chip group focus-visible:ring-accent pointer-events-auto absolute flex touch-none flex-col overflow-hidden rounded-[5px] px-2 py-1 text-left ring-1 transition-shadow ring-inset focus-visible:ring-2 focus-visible:outline-none',
        event.isBooking && 'cal-chip-booking',
        isDragging || isResizing ? 'z-30 cursor-grabbing shadow-lg' : 'z-10 cursor-grab hover:z-20 hover:shadow-md',
      )}
      data-booking={event.isBooking || undefined}
      data-event-chip
      onClick={event => onSelect(event.currentTarget.getBoundingClientRect())}
      onPointerCancel={onMoveCancel}
      onPointerDown={onMoveDown}
      onPointerMove={onMoveMove}
      onPointerUp={onMoveUp}
      style={{ ...chipStyle(event.color), height, left, top, width }}
      title={`${event.title} · ${event.start}`}
      type="button"
    >
      <span className="flex items-start gap-1.5">
        <span
          className={cn(
            'min-w-0 flex-1 overflow-hidden text-xs leading-tight font-semibold',
            titleLines === 1 ? 'truncate' : 'break-words whitespace-normal',
          )}
          style={
            titleLines > 1
              ? { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: titleLines }
              : undefined
          }
        >
          {event.title}
        </span>
        {event.recurring ? <Repeat className="mt-px size-3 shrink-0 opacity-50" /> : null}
      </span>
      {timeLabel ? <span className="mt-0.5 text-[11px] tabular-nums opacity-70">{timeLabel}</span> : null}
      <span
        className="absolute inset-x-0 bottom-0 z-10 flex h-2.5 cursor-ns-resize touch-none items-end justify-center pb-0.5 opacity-0 transition-opacity group-hover:opacity-100"
        data-event-chip
        data-resize-handle
        onClick={event => event.stopPropagation()}
        onPointerDown={onResizeDown}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeUp}
      >
        <span className="h-1 w-7 rounded-full bg-current opacity-30" />
      </span>
    </button>
  );
}
