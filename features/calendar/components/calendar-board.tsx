'use client'

import * as Ariakit from '@ariakit/react'
import { Repeat } from 'lucide-react'
import { useOptimistic, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { moveEvent, resizeEvent } from '../calendar-actions'
import type { CalendarEvent, CalendarName } from '../types/calendar'
import { dateKey, formatDay, timeToMinutes } from '../calendar-utils'
import {
  END_MINUTES,
  GRID_HEIGHT,
  HOUR_HEIGHT,
  HOURS,
  minutesToTime,
  nearestDuration,
  packDay,
  SNAP_MINUTES,
  snapMinutes,
  START_HOUR,
} from '../calendar-layout'
import { useNow } from '../hooks/use-now'
import { EventCreateDialog } from './event-create-dialog'
import { EventEditor } from './event-editor'
import { useCalendarVisibility } from './calendar-visibility'

const calendarChip: Record<CalendarName, string> = {
  focus: 'bg-indigo-500 text-white ring-black/5 shadow-sm dark:bg-indigo-600',
  personal: 'bg-rose-500 text-white ring-black/5 shadow-sm dark:bg-rose-600',
  team: 'bg-accent text-white ring-black/5 shadow-sm dark:bg-accent-hover',
}

export function CalendarBoard({ days, events, view }: { days: string[]; events: CalendarEvent[]; view: 'day' | 'week' }) {
  const { hidden } = useCalendarVisibility()
  const gridTemplate = `4.5rem repeat(${days.length}, minmax(0, 1fr))`
  const gridMinWidth = view === 'week' ? 760 : undefined
  const [optimisticEvents, setOptimisticEvents] = useOptimistic(
    events,
    (
      current,
      next:
        | { day: string; everyWeekday?: boolean; recurring?: boolean; sourceId: string; start: string; type: 'move' }
        | { sourceId: string; type: 'delete' }
        | { duration: number; sourceId: string; type: 'resize' }
        | { event: Pick<CalendarEvent, 'color' | 'duration' | 'sourceId' | 'start' | 'title'>; type: 'update' },
    ) => {
      if (next.type === 'delete') {
        return current.filter((event) => event.sourceId !== next.sourceId)
      }
      if (next.type === 'resize') {
        return current.map((event) => (event.sourceId === next.sourceId ? { ...event, duration: next.duration } : event))
      }
      if (next.type === 'update') {
        return current.map((event) =>
          event.sourceId === next.event.sourceId ? { ...event, ...next.event } : event,
        )
      }
      return current.map((event) => {
        if (event.sourceId !== next.sourceId) return event
        if (next.recurring && next.everyWeekday) return { ...event, start: next.start }
        return { ...event, day: next.day, start: next.start }
      })
    },
  )
  const [isPending, startTransition] = useTransition()
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [dragMove, setDragMove] = useState<{ day: string; sourceId: string; startMin: number } | null>(null)
  const [createSel, setCreateSel] = useState<{ aMin: number; bMin: number; day: string } | null>(null)
  const [createDraft, setCreateDraft] = useState<{ day: string; duration: number; start: string } | null>(null)
  const [resize, setResize] = useState<{ colTop: number; endMin: number; sourceId: string; startMin: number } | null>(null)
  const resizingRef = useRef(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const moveRef = useRef<{ duration: number; grabOffsetMin: number; moved: boolean; sourceId: string; x0: number; y0: number } | null>(null)
  const suppressClickRef = useRef(false)
  const createStore = Ariakit.useDialogStore({
    setOpen(open) {
      if (!open) setCreateDraft(null)
    },
  })
  const now = useNow()
  const todayKey = now ? dateKey(now) : null
  const nowMinutes = now ? now.getHours() * 60 + now.getMinutes() : 0

  function pointToDayIndex(clientX: number) {
    const grid = gridRef.current
    if (!grid) return 0
    const rect = grid.getBoundingClientRect()
    const gutter = 72
    const colWidth = (rect.width - gutter) / days.length
    return Math.max(0, Math.min(days.length - 1, Math.floor((clientX - rect.left - gutter) / colWidth)))
  }

  function pointToMinutes(clientY: number) {
    const grid = gridRef.current
    if (!grid) return START_HOUR * 60
    const rect = grid.getBoundingClientRect()
    return START_HOUR * 60 + ((clientY - rect.top - 12) / HOUR_HEIGHT) * 60
  }

  function effectiveDay(event: CalendarEvent) {
    return dragMove?.sourceId === event.sourceId ? dragMove.day : event.day
  }

  function effectiveStartMin(event: CalendarEvent) {
    return dragMove?.sourceId === event.sourceId ? dragMove.startMin : timeToMinutes(event.start)
  }

  // Pointer-based move: the event block itself follows the cursor (snapped to the
  // grid) and drops into whichever day column it's over — no floating HTML5 ghost.
  function handleMoveDown(calendarEvent: CalendarEvent, pointerEvent: React.PointerEvent<HTMLButtonElement>) {
    if (pointerEvent.button !== 0 || calendarEvent.recurring) return
    if ((pointerEvent.target as HTMLElement).closest('[data-resize-handle]')) return
    pointerEvent.stopPropagation()
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId)
    moveRef.current = {
      duration: calendarEvent.duration,
      grabOffsetMin: pointToMinutes(pointerEvent.clientY) - timeToMinutes(calendarEvent.start),
      moved: false,
      sourceId: calendarEvent.sourceId,
      x0: pointerEvent.clientX,
      y0: pointerEvent.clientY,
    }
  }

  function handleMoveMove(pointerEvent: React.PointerEvent<HTMLButtonElement>) {
    const origin = moveRef.current
    if (!origin) return
    if (!origin.moved) {
      if (Math.abs(pointerEvent.clientX - origin.x0) < 4 && Math.abs(pointerEvent.clientY - origin.y0) < 4) return
      origin.moved = true
    }
    const day = days[pointToDayIndex(pointerEvent.clientX)]
    const raw = pointToMinutes(pointerEvent.clientY) - origin.grabOffsetMin
    const snapped = Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES
    const startMin = Math.max(START_HOUR * 60, Math.min(END_MINUTES - origin.duration, snapped))
    setDragMove({ day, sourceId: origin.sourceId, startMin })
  }

  function handleMoveUp(pointerEvent: React.PointerEvent<HTMLButtonElement>) {
    const origin = moveRef.current
    moveRef.current = null
    try {
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId)
    } catch {}
    const target = dragMove
    setDragMove(null)
    if (!origin || !origin.moved || !target) return
    suppressClickRef.current = true
    requestAnimationFrame(() => {
      suppressClickRef.current = false
    })
    const start = minutesToTime(target.startMin)
    const { day, sourceId } = target
    startTransition(async () => {
      setOptimisticEvents({ day, sourceId, start, type: 'move' })
      const result = await moveEvent({ day, sourceId, start })
      if (result.error) toast.error(result.error)
    })
  }

  function handlePointerDown(day: string, event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest('[data-event-chip]')) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const minutes = snapMinutes(event.clientY, bounds.top)
    event.currentTarget.setPointerCapture(event.pointerId)
    setCreateSel({ aMin: minutes, bMin: minutes, day })
  }

  function handlePointerMove(day: string, event: React.PointerEvent<HTMLDivElement>) {
    if (!createSel || createSel.day !== day) return
    const bounds = event.currentTarget.getBoundingClientRect()
    setCreateSel((current) => (current ? { ...current, bMin: snapMinutes(event.clientY, bounds.top) } : current))
  }

  function handlePointerUp(day: string, event: React.PointerEvent<HTMLDivElement>) {
    if (!createSel || createSel.day !== day) return
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {}
    const lo = Math.min(createSel.aMin, createSel.bMin)
    const hi = Math.max(createSel.aMin, createSel.bMin)
    const duration = hi - lo >= SNAP_MINUTES ? nearestDuration(hi - lo) : 60
    setCreateSel(null)
    setCreateDraft({ day, duration, start: minutesToTime(Math.min(lo, END_MINUTES - 60)) })
    createStore.show()
  }

  function handleResizeDown(event: CalendarEvent, pointerEvent: React.PointerEvent<HTMLElement>) {
    pointerEvent.stopPropagation()
    pointerEvent.preventDefault()
    resizingRef.current = true
    const column = (pointerEvent.currentTarget as HTMLElement).closest('[data-day-column]')
    const colTop = column ? column.getBoundingClientRect().top : 0
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId)
    const startMin = timeToMinutes(event.start)
    setResize({ colTop, endMin: startMin + event.duration, sourceId: event.sourceId, startMin })
  }

  function handleResizeMove(pointerEvent: React.PointerEvent<HTMLElement>) {
    if (!resize) return
    const raw = snapMinutes(pointerEvent.clientY, resize.colTop)
    setResize((current) => (current ? { ...current, endMin: Math.max(current.startMin + SNAP_MINUTES, raw) } : current))
  }

  function handleResizeUp(pointerEvent: React.PointerEvent<HTMLElement>) {
    if (!resize) return
    try {
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId)
    } catch {}
    const duration = resize.endMin - resize.startMin
    const sourceId = resize.sourceId
    setResize(null)
    requestAnimationFrame(() => {
      resizingRef.current = false
    })
    startTransition(async () => {
      setOptimisticEvents({ duration, sourceId, type: 'resize' })
      const result = await resizeEvent({ duration, sourceId })
      if (result.error) toast.error(result.error)
    })
  }

  return (
    <div className="relative select-none">
      {isPending ? (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-40 h-0.5 overflow-hidden">
          <div className="bg-accent h-full w-1/3" style={{ animation: 'loading-slide 0.9s ease-in-out infinite' }} />
        </div>
      ) : null}
      <div
        className="sticky top-0 z-20 grid border-b border-divider bg-surface/90 backdrop-blur dark:border-divider-dark dark:bg-surface-dark/90"
        style={{ gridTemplateColumns: gridTemplate, minWidth: gridMinWidth }}
      >
        <div />
        {days.map((day) => {
          const [weekday, dayNumber] = formatDay(day).split(' ')
          const isToday = day === todayKey
          return (
            <div className="px-3 py-2.5" key={day}>
              <p className={cn('text-xs font-medium uppercase', isToday ? 'text-accent' : 'text-muted')}>{weekday}</p>
              <p
                className={cn(
                  'mt-1 inline-flex h-8 min-w-8 items-center justify-center rounded-full px-1.5 text-lg font-semibold tabular-nums',
                  isToday && 'bg-accent text-white',
                )}
              >
                {dayNumber}
              </p>
            </div>
          )
        })}
      </div>
      <div className="grid pt-3" ref={gridRef} style={{ gridTemplateColumns: gridTemplate, minWidth: gridMinWidth }}>
        <div className="border-r border-divider dark:border-divider-dark">
          {HOURS.map((hour) => (
            <div className="relative h-[72px] pr-3 text-right" key={hour}>
              <span className="text-muted absolute -top-2 right-3 text-xs tabular-nums">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>
        {days.map((day) => {
          const isToday = day === todayKey
          const showNow = isToday && nowMinutes >= START_HOUR * 60 && nowMinutes <= END_MINUTES
          const dayEvents = optimisticEvents.filter((event) => effectiveDay(event) === day && !hidden.has(event.calendar))
          const layout = packDay(dayEvents)
          const selectionLo = createSel?.day === day ? Math.min(createSel.aMin, createSel.bMin) : null
          const selectionHi = createSel?.day === day ? Math.max(createSel.aMin, createSel.bMin) : null
          return (
            <div
              className={cn(
                'relative border-r border-divider dark:border-divider-dark',
                isToday && 'bg-accent/[0.035]',
              )}
              data-day-column
              key={day}
              onPointerDown={(event) => handlePointerDown(day, event)}
              onPointerMove={(event) => handlePointerMove(day, event)}
              onPointerUp={(event) => handlePointerUp(day, event)}
              style={{ height: GRID_HEIGHT }}
            >
              {HOURS.map((hour) => (
                <div className="h-[72px] border-b border-divider/60 dark:border-divider-dark/60" key={hour} />
              ))}
              {showNow ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 z-30"
                  style={{ top: ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT }}
                  suppressHydrationWarning
                >
                  <div className="relative h-px bg-accent">
                    <span
                      className="absolute -top-[3px] -left-1 size-2 rounded-full bg-accent"
                      style={{ animation: 'now-pulse 2s ease-in-out infinite' }}
                    />
                  </div>
                </div>
              ) : null}
              {dayEvents.map((event) => {
                const startMin = effectiveStartMin(event)
                const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT
                const isResizing = resize?.sourceId === event.sourceId
                const isDragging = dragMove?.sourceId === event.sourceId
                const displayDuration = isResizing ? resize!.endMin - resize!.startMin : event.duration
                const height = Math.max(22, (displayDuration / 60) * HOUR_HEIGHT - 3)
                const place = layout.get(event.id) ?? { col: 0, cols: 1 }
                const widthPct = 100 / place.cols
                return (
                  <button
                    className={cn(
                      'group absolute flex touch-none flex-col overflow-hidden rounded-[5px] px-2 py-1 text-left ring-1 ring-inset transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
                      isDragging || isResizing ? 'z-30 cursor-grabbing shadow-lg' : 'z-10 cursor-grab hover:z-20 hover:shadow-md',
                      event.recurring && 'cursor-pointer',
                      calendarChip[event.calendar],
                    )}
                    data-event-chip
                    key={event.id}
                    onClick={() => {
                      if (suppressClickRef.current) return
                      setSelectedEvent(event)
                    }}
                    onPointerDown={(pointerEvent) => handleMoveDown(event, pointerEvent)}
                    onPointerMove={handleMoveMove}
                    onPointerUp={handleMoveUp}
                    style={{
                      height,
                      left: `calc(${place.col * widthPct}% + 2px)`,
                      top,
                      width: `calc(${widthPct}% - 4px)`,
                    }}
                    title={`${event.title} · ${event.start}`}
                    type="button"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold leading-tight">{event.title}</span>
                      {event.recurring ? <Repeat className="size-3 shrink-0 opacity-50" /> : null}
                    </span>
                    {height > 32 ? (
                      <span className="mt-0.5 text-[11px] tabular-nums opacity-70">
                        {isResizing ? minutesToTime(resize!.endMin) : minutesToTime(startMin)}
                      </span>
                    ) : null}
                    {!event.recurring ? (
                      <span
                        className="absolute inset-x-0 bottom-0 z-10 flex h-2.5 cursor-ns-resize touch-none items-end justify-center pb-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                        data-event-chip
                        data-resize-handle
                        onClick={(clickEvent) => clickEvent.stopPropagation()}
                        onPointerDown={(pointerEvent) => handleResizeDown(event, pointerEvent)}
                        onPointerMove={handleResizeMove}
                        onPointerUp={handleResizeUp}
                      >
                        <span className="h-1 w-7 rounded-full bg-white/70" />
                      </span>
                    ) : null}
                  </button>
                )
              })}
              {selectionLo !== null && selectionHi !== null ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-1 z-30 flex flex-col justify-between rounded-[5px] bg-accent/15 px-2 py-1 ring-1 ring-accent/50"
                  style={{
                    height: Math.max((SNAP_MINUTES / 60) * HOUR_HEIGHT, ((selectionHi - selectionLo) / 60) * HOUR_HEIGHT),
                    top: ((selectionLo - START_HOUR * 60) / 60) * HOUR_HEIGHT,
                  }}
                >
                  <span className="text-accent text-[11px] font-semibold tabular-nums">{minutesToTime(selectionLo)}</span>
                  {selectionHi > selectionLo ? (
                    <span className="text-accent/80 text-[11px] font-semibold tabular-nums">{minutesToTime(selectionHi)}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
      {selectedEvent ? (
        <EventEditor
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDeleted={(sourceId) => setOptimisticEvents({ sourceId, type: 'delete' })}
          onUpdated={(event) => setOptimisticEvents({ event, type: 'update' })}
        />
      ) : null}
      {createDraft ? (
        <EventCreateDialog
          key={`${createDraft.day}-${createDraft.start}-${createDraft.duration}`}
          day={createDraft.day}
          defaultDuration={createDraft.duration}
          defaultStart={createDraft.start}
          store={createStore}
        />
      ) : null}
    </div>
  )
}

// The empty board itself — same grid the real board renders, minus events.
// Events stream in on top of it, so there are no placeholder "skeleton" events.
export function CalendarBoardSkeleton({ days = 7 }: { days?: number }) {
  const gridTemplate = `4.5rem repeat(${days}, minmax(0, 1fr))`
  const minWidth = days > 1 ? 760 : undefined
  return (
    <div>
      <div
        className="grid border-b border-divider dark:border-divider-dark"
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
        <div className="border-r border-divider dark:border-divider-dark">
          {HOURS.map((hour) => (
            <div className="relative h-[72px] pr-3 text-right" key={hour}>
              <span className="text-muted absolute -top-2 right-3 text-xs tabular-nums">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>
        {Array.from({ length: days }).map((_, dayIndex) => (
          <div className="border-r border-divider dark:border-divider-dark" style={{ height: GRID_HEIGHT }} key={dayIndex}>
            {HOURS.map((hour) => (
              <div className="h-[72px] border-b border-divider/60 dark:border-divider-dark/60" key={hour} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
