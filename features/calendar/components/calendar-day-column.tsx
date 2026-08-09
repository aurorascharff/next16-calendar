'use client';

import { cn } from '@/lib/utils';
import { timeToMinutes } from '../calendar-utils';
import { chipStyle } from '../utils/colors';
import { GRID_HEIGHT, HOUR_HEIGHT, HOURS, minutesToTime, packDay, SNAP_MINUTES, START_HOUR } from '../utils/grid';
import { EventChip } from './calendar-event-chip';
import { NowLine } from './calendar-now-line';
import type { CalendarBoardInteractions } from '../hooks/use-calendar-board';
import type { CalendarEvent } from '../types/calendar';

export function DayColumn({
  day,
  events,
  interaction,
  isToday,
  nowMinutes,
  showNow,
}: {
  day: string;
  events: CalendarEvent[];
  interaction: CalendarBoardInteractions;
  isToday: boolean;
  nowMinutes: number;
  showNow: boolean;
}) {
  const layout = packDay(events);
  const selection = interaction.getSelection(day);

  return (
    <div
      className={cn('border-divider dark:border-divider-dark relative border-r', isToday && 'bg-accent/[0.035]')}
      data-day-column
      onPointerDown={event => interaction.create.onPointerDown(day, event)}
      onPointerMove={event => interaction.create.onPointerMove(day, event)}
      onPointerUp={event => interaction.create.onPointerUp(day, event)}
      style={{ height: GRID_HEIGHT }}
    >
      {HOURS.map(hour => (
        <div className="border-divider/60 dark:border-divider-dark/60 h-[72px] border-b" key={hour} />
      ))}
      {showNow ? <NowLine minutes={nowMinutes} /> : null}
      {events.map(event => {
        const startMin =
          interaction.dragMove?.id === event.id ? interaction.dragMove.startMin : timeToMinutes(event.start);
        const isResizing = interaction.resize?.sourceId === event.sourceId;
        const isDragging = interaction.dragMove?.id === event.id;
        const displayDuration = isResizing ? interaction.resize!.endMin - interaction.resize!.startMin : event.duration;
        const height = Math.max(22, (displayDuration / 60) * HOUR_HEIGHT - 3);
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
            top={((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT}
            width={`calc(${widthPct}% - 4px)`}
          />
        );
      })}
      {selection ? (
        <div
          aria-hidden
          className="cal-chip pointer-events-none absolute inset-x-1 z-30 flex flex-col overflow-hidden rounded-[5px] px-2 py-1 opacity-90 ring-1 ring-inset"
          style={{
            ...chipStyle(interaction.selectionColor),
            height: Math.max((SNAP_MINUTES / 60) * HOUR_HEIGHT, ((selection.hi - selection.lo) / 60) * HOUR_HEIGHT),
            top: ((selection.lo - START_HOUR * 60) / 60) * HOUR_HEIGHT,
          }}
        >
          <span className="text-xs leading-tight font-semibold">New event</span>
          <span className="mt-0.5 text-[11px] tabular-nums opacity-70">{minutesToTime(selection.lo)}</span>
        </div>
      ) : null}
    </div>
  );
}
