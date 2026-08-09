'use client'

import { cn } from '@/lib/utils'
import { chipStyle } from '../utils/colors'
import type { CalendarColor, CalendarEvent } from '../types/calendar'
import { timeToMinutes } from '../calendar-utils'
import { GRID_HEIGHT, HOUR_HEIGHT, HOURS, minutesToTime, packDay, SNAP_MINUTES, START_HOUR } from '../utils/grid'
import { EventChip } from './calendar-event-chip'
import { NowLine } from './calendar-now-line'

type PointerHandler = (day: string, event: React.PointerEvent<HTMLDivElement>) => void
type EventPointerHandler = (event: CalendarEvent, pointerEvent: React.PointerEvent<HTMLElement>) => void

export function DayColumn({
  day,
  dragMove,
  events,
  isToday,
  nowMinutes,
  onCreateDown,
  onCreateMove,
  onCreateUp,
  onEventSelect,
  onMoveDown,
  onMoveMove,
  onMoveUp,
  onResizeDown,
  onResizeMove,
  onResizeUp,
  resize,
  selectionColor,
  selectionHi,
  selectionLo,
  showNow,
}: {
  day: string
  dragMove: { day: string; id: string; startMin: number } | null
  events: CalendarEvent[]
  isToday: boolean
  nowMinutes: number
  onCreateDown: PointerHandler
  onCreateMove: PointerHandler
  onCreateUp: PointerHandler
  onEventSelect: (event: CalendarEvent) => void
  onMoveDown: EventPointerHandler
  onMoveMove: (pointerEvent: React.PointerEvent<HTMLElement>) => void
  onMoveUp: (pointerEvent: React.PointerEvent<HTMLElement>) => void
  onResizeDown: EventPointerHandler
  onResizeMove: (pointerEvent: React.PointerEvent<HTMLElement>) => void
  onResizeUp: (pointerEvent: React.PointerEvent<HTMLElement>) => void
  resize: { endMin: number; sourceId: string; startMin: number } | null
  selectionColor: CalendarColor
  selectionHi: number | null
  selectionLo: number | null
  showNow: boolean
}) {
  const layout = packDay(events)

  return (
    <div
      className={cn('relative border-r border-divider dark:border-divider-dark', isToday && 'bg-accent/[0.035]')}
      data-day-column
      onPointerDown={(event) => onCreateDown(day, event)}
      onPointerMove={(event) => onCreateMove(day, event)}
      onPointerUp={(event) => onCreateUp(day, event)}
      style={{ height: GRID_HEIGHT }}
    >
      {HOURS.map((hour) => (
        <div className="h-[72px] border-b border-divider/60 dark:border-divider-dark/60" key={hour} />
      ))}
      {showNow ? <NowLine minutes={nowMinutes} /> : null}
      {events.map((event) => {
        const startMin = dragMove?.id === event.id ? dragMove.startMin : timeToMinutes(event.start)
        const isResizing = resize?.sourceId === event.sourceId
        const isDragging = dragMove?.id === event.id
        const displayDuration = isResizing ? resize!.endMin - resize!.startMin : event.duration
        const height = Math.max(22, (displayDuration / 60) * HOUR_HEIGHT - 3)
        const place = layout.get(event.id) ?? { col: 0, cols: 1 }
        const widthPct = 100 / place.cols
        return (
          <EventChip
            event={event}
            height={height}
            isDragging={isDragging}
            isResizing={isResizing}
            key={event.id}
            left={`calc(${place.col * widthPct}% + 2px)`}
            onMoveDown={(pointerEvent) => onMoveDown(event, pointerEvent)}
            onMoveMove={onMoveMove}
            onMoveUp={onMoveUp}
            onResizeDown={(pointerEvent) => onResizeDown(event, pointerEvent)}
            onResizeMove={onResizeMove}
            onResizeUp={onResizeUp}
            onSelect={() => onEventSelect(event)}
            timeLabel={height >= 46 ? (isResizing ? minutesToTime(resize!.endMin) : minutesToTime(startMin)) : null}
            top={((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT}
            width={`calc(${widthPct}% - 4px)`}
          />
        )
      })}
      {selectionLo !== null && selectionHi !== null ? (
        <div
          aria-hidden
          className="cal-chip pointer-events-none absolute inset-x-1 z-30 flex flex-col overflow-hidden rounded-[5px] px-2 py-1 opacity-90 ring-1 ring-inset"
          style={{
            ...chipStyle(selectionColor),
            height: Math.max((SNAP_MINUTES / 60) * HOUR_HEIGHT, ((selectionHi - selectionLo) / 60) * HOUR_HEIGHT),
            top: ((selectionLo - START_HOUR * 60) / 60) * HOUR_HEIGHT,
          }}
        >
          <span className="text-xs font-semibold leading-tight">New event</span>
          <span className="mt-0.5 text-[11px] tabular-nums opacity-70">{minutesToTime(selectionLo)}</span>
        </div>
      ) : null}
    </div>
  )
}
