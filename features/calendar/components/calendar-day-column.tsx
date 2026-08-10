'use client';

import { Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chipStyle } from '../utils/colors';
import {
  displayMinutes,
  END_MINUTES,
  eventStartMinutes,
  GRID_HEIGHT,
  HOUR_HEIGHT,
  HOURS,
  minutesToTime,
  packDay,
  SNAP_MINUTES,
  START_MINUTES,
  topFor,
} from '../utils/grid';
import type { CalendarBoardInteractions } from '../hooks/use-calendar-board';
import type { CalendarEvent } from '../types/calendar';

function eventHeight(duration: number) {
  return Math.max(22, (duration / 60) * HOUR_HEIGHT - 3);
}

function visibleEventHeight(duration: number, startMin: number) {
  return Math.max(0, Math.min(eventHeight(duration), GRID_HEIGHT - topFor(startMin)));
}

type PointerHandler = (event: React.PointerEvent<HTMLElement>) => void;

function titleLineCount(height: number, hasTimeLabel: boolean) {
  const availableHeight = height - 12 - (hasTimeLabel ? 17 : 0);
  return Math.max(1, Math.floor(availableHeight / 15));
}

export function CalendarEventLayer({
  events,
  interaction,
}: {
  events: CalendarEvent[];
  interaction: CalendarBoardInteractions;
}) {
  const layout = packDay(events);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {events.map(event => {
        const startMin =
          interaction.dragMove?.id === event.id ? interaction.dragMove.startMin : eventStartMinutes(event.start);
        const isResizing = interaction.resize?.sourceId === event.sourceId;
        const isDragging = interaction.dragMove?.id === event.id;
        const displayDuration = isResizing ? interaction.resize!.endMin - interaction.resize!.startMin : event.duration;
        const height = visibleEventHeight(displayDuration, startMin);
        const place = layout.get(event.id) ?? { col: 0, cols: 1 };
        const widthPct = 100 / place.cols;
        return (
          <EventChip
            event={event}
            height={height}
            isDragging={isDragging}
            isResizing={isResizing}
            key={event.id}
            left={`calc(${place.col * widthPct}% + 2px)`}
            onMoveDown={pointerEvent => interaction.move.onPointerDown(event, pointerEvent)}
            onMoveMove={interaction.move.onPointerMove}
            onMoveUp={interaction.move.onPointerUp}
            onMoveCancel={interaction.move.onPointerCancel}
            onResizeLostPointerCapture={interaction.resizeHandlers.onLostPointerCapture}
            onResizeCancel={interaction.resizeHandlers.onPointerCancel}
            onResizeDown={pointerEvent => interaction.resizeHandlers.onPointerDown(event, pointerEvent)}
            onResizeMove={interaction.resizeHandlers.onPointerMove}
            onResizeUp={interaction.resizeHandlers.onPointerUp}
            onSelect={anchorRect => interaction.onEventSelect(event, anchorRect)}
            timeLabel={
              height >= 46 ? (isResizing ? minutesToTime(interaction.resize!.endMin) : minutesToTime(startMin)) : null
            }
            top={topFor(startMin)}
            width={`calc(${widthPct}% - 4px)`}
          />
        );
      })}
    </div>
  );
}

export function DayColumn({
  day,
  interaction,
  isToday,
  nowMinutes,
  renderGrid = true,
  showNow,
}: {
  day: string;
  interaction: CalendarBoardInteractions;
  isToday: boolean;
  nowMinutes: number;
  renderGrid?: boolean;
  showNow: boolean;
}) {
  const selection = interaction.getSelection(day);

  return (
    <div
      className={cn(
        'relative',
        renderGrid && 'border-divider dark:border-divider-dark border-r',
        isToday && 'bg-card/40 dark:bg-card-dark/40',
      )}
      data-day-column
      onLostPointerCapture={interaction.create.onLostPointerCapture}
      onPointerCancel={interaction.create.onPointerCancel}
      onPointerDown={event => interaction.create.onPointerDown(day, event)}
      onPointerMove={event => interaction.create.onPointerMove(day, event)}
      onPointerUp={event => interaction.create.onPointerUp(day, event)}
      style={{ height: GRID_HEIGHT }}
    >
      {renderGrid
        ? HOURS.map(hour => (
            <div
              className={cn(
                'border-divider/60 dark:border-divider-dark/60 h-[72px] border-b',
                hour === 0 && 'border-t',
              )}
              key={hour}
            />
          ))
        : null}
      {showNow ? <NowLine minutes={nowMinutes} /> : null}
      {selection ? (
        <div
          aria-hidden
          className="cal-chip pointer-events-none absolute right-0.5 left-0.5 z-30 flex flex-col overflow-hidden rounded-[5px] px-2 py-1 ring-1 ring-inset"
          style={{
            ...chipStyle(interaction.selectionColor),
            height: eventHeight(Math.max(SNAP_MINUTES, selection.hi - selection.lo)),
            top: topFor(selection.lo),
          }}
        >
          <span className="text-xs leading-tight font-semibold">New event</span>
          <span className="mt-0.5 text-[11px] tabular-nums opacity-70">{minutesToTime(selection.lo)}</span>
        </div>
      ) : null}
    </div>
  );
}

function EventChip({
  event,
  height,
  isDragging,
  isResizing,
  left,
  onMoveDown,
  onMoveMove,
  onMoveUp,
  onMoveCancel,
  onResizeLostPointerCapture,
  onResizeCancel,
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
  onResizeLostPointerCapture: PointerHandler;
  onResizeCancel: PointerHandler;
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
        onLostPointerCapture={onResizeLostPointerCapture}
        onPointerCancel={onResizeCancel}
        onPointerDown={onResizeDown}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeUp}
      >
        <span className="h-1 w-7 rounded-full bg-current opacity-30" />
      </span>
    </button>
  );
}

function NowLine({ minutes }: { minutes: number }) {
  const display = displayMinutes(minutes);
  if (display < START_MINUTES || display > END_MINUTES) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-20"
      style={{ top: ((display - START_MINUTES) / 60) * HOUR_HEIGHT }}
      suppressHydrationWarning
    >
      <div className="bg-action relative h-px">
        <span
          className="bg-action absolute -top-[3px] -left-1 size-2 rounded-full"
          style={{ animation: 'now-pulse 2s ease-in-out infinite' }}
        />
      </div>
    </div>
  );
}
