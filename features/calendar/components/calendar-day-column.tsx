'use client';

import { cn } from '@/lib/utils';
import { chipStyle } from '../utils/colors';
import {
  eventStartMinutes,
  GRID_HEIGHT,
  HOUR_HEIGHT,
  HOURS,
  minutesToTime,
  packDay,
  SNAP_MINUTES,
  topFor,
} from '../utils/grid';
import { EventChip } from './calendar-event-chip';
import { NowLine } from './calendar-now-line';
import type { CalendarBoardInteractions } from '../hooks/use-calendar-board';
import type { CalendarEvent } from '../types/calendar';

function eventHeight(duration: number) {
  return Math.max(22, (duration / 60) * HOUR_HEIGHT - 3);
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
        const height = eventHeight(displayDuration);
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
  showNow,
}: {
  day: string;
  interaction: CalendarBoardInteractions;
  isToday: boolean;
  nowMinutes: number;
  showNow: boolean;
}) {
  const selection = interaction.getSelection(day);

  return (
    <div
      className={cn(
        'border-divider dark:border-divider-dark relative border-r',
        isToday && 'bg-card/40 dark:bg-card-dark/40',
      )}
      data-day-column
      onPointerCancel={interaction.create.onPointerCancel}
      onPointerDown={event => interaction.create.onPointerDown(day, event)}
      onPointerMove={event => interaction.create.onPointerMove(day, event)}
      onPointerUp={event => interaction.create.onPointerUp(day, event)}
      style={{ height: GRID_HEIGHT }}
    >
      {HOURS.map(hour => (
        <div
          className={cn('border-divider/60 dark:border-divider-dark/60 h-[72px] border-b', hour === 0 && 'border-t')}
          key={hour}
        />
      ))}
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
