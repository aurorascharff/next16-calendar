'use client'

import * as Ariakit from '@ariakit/react'
import { Repeat } from 'lucide-react'
import { useEffect, useOptimistic, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { moveEvent } from '../calendar-actions'
import type { CalendarEvent, CalendarName, CalendarWeek } from '../types/calendar'
import { dateKey, formatDay, timeToMinutes } from '../calendar-utils'
import { EventCreateDialog } from './event-create-dialog'
import { EventEditor } from './event-editor'
import { useCalendarVisibility } from './calendar-visibility'

const HOUR_HEIGHT = 72
const START_HOUR = 8
const HOURS = Array.from({ length: 11 }, (_, index) => START_HOUR + index)
const END_MINUTES = (START_HOUR + HOURS.length) * 60
const GRID_HEIGHT = HOURS.length * HOUR_HEIGHT
const SNAP_MINUTES = 15
const DURATION_OPTIONS = [30, 45, 60, 90, 120]

// The calendar owns the color, matching the sidebar legend (Focus/Team/Personal).
// Vibrant in light mode; a shade deeper in dark so they don't over-contrast the
// neutral chrome.
const calendarChip: Record<CalendarName, string> = {
  focus: 'bg-indigo-500 text-white ring-black/5 shadow-sm dark:bg-indigo-600',
  personal: 'bg-rose-500 text-white ring-black/5 shadow-sm dark:bg-rose-600',
  team: 'bg-accent text-white ring-black/5 shadow-sm dark:bg-accent-hover',
}

type Placement = { col: number; cols: number }

function packDay(events: CalendarEvent[]): Map<string, Placement> {
  const items = events
    .map((event) => ({ end: timeToMinutes(event.start) + event.duration, event, start: timeToMinutes(event.start) }))
    .sort((a, b) => a.start - b.start || a.end - b.end)

  const placement = new Map<string, Placement>()
  let cluster: typeof items = []
  let clusterEnd = -1

  function flush() {
    const columnEnds: number[] = []
    for (const item of cluster) {
      let col = columnEnds.findIndex((end) => end <= item.start)
      if (col === -1) {
        col = columnEnds.length
        columnEnds.push(item.end)
      } else {
        columnEnds[col] = item.end
      }
      placement.set(item.event.id, { col, cols: 0 })
    }
    for (const item of cluster) {
      placement.get(item.event.id)!.cols = columnEnds.length
    }
    cluster = []
    clusterEnd = -1
  }

  for (const item of items) {
    if (cluster.length && item.start >= clusterEnd) flush()
    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, item.end)
  }
  flush()

  return placement
}

function useNow() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  return now
}

function snapMinutes(clientY: number, boundsTop: number) {
  const offset = Math.max(0, Math.min(GRID_HEIGHT, clientY - boundsTop))
  const raw = START_HOUR * 60 + (offset / HOUR_HEIGHT) * 60
  const snapped = Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES
  return Math.max(START_HOUR * 60, Math.min(END_MINUTES, snapped))
}

function minutesToTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function nearestDuration(minutes: number) {
  return DURATION_OPTIONS.reduce((best, option) =>
    Math.abs(option - minutes) < Math.abs(best - minutes) ? option : best,
  )
}

export function CalendarBoard({ week }: { week: CalendarWeek }) {
  const { hidden } = useCalendarVisibility()
  const [optimisticEvents, setOptimisticEvents] = useOptimistic(
    week.events,
    (
      current,
      next:
        | { day: string; everyWeekday?: boolean; recurring?: boolean; sourceId: string; start: string; type: 'move' }
        | { sourceId: string; type: 'delete' }
        | { event: Pick<CalendarEvent, 'color' | 'duration' | 'sourceId' | 'start' | 'title'>; type: 'update' },
    ) => {
      if (next.type === 'delete') {
        return current.filter((event) => event.sourceId !== next.sourceId)
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
  const [dropTarget, setDropTarget] = useState<{ day: string; minutes: number } | null>(null)
  const [createSel, setCreateSel] = useState<{ aMin: number; bMin: number; day: string } | null>(null)
  const [createDraft, setCreateDraft] = useState<{ day: string; duration: number; start: string } | null>(null)
  const createStore = Ariakit.useDialogStore({
    setOpen(open) {
      if (!open) setCreateDraft(null)
    },
  })
  const now = useNow()
  const todayKey = now ? dateKey(now) : null
  const nowMinutes = now ? now.getHours() * 60 + now.getMinutes() : 0

  function handleDragOver(day: string, dragEvent: React.DragEvent<HTMLDivElement>) {
    dragEvent.preventDefault()
    const bounds = dragEvent.currentTarget.getBoundingClientRect()
    setDropTarget({ day, minutes: Math.min(END_MINUTES - SNAP_MINUTES, snapMinutes(dragEvent.clientY, bounds.top)) })
  }

  function handleDrop(day: string, dropEvent: React.DragEvent<HTMLDivElement>) {
    setDropTarget(null)
    const sourceId = dropEvent.dataTransfer.getData('text/pace-event')
    if (!sourceId) return
    const dragged = optimisticEvents.find((event) => event.sourceId === sourceId)
    const bounds = dropEvent.currentTarget.getBoundingClientRect()
    const start = minutesToTime(Math.min(END_MINUTES - SNAP_MINUTES, snapMinutes(dropEvent.clientY, bounds.top)))
    startTransition(async () => {
      setOptimisticEvents({
        day,
        everyWeekday: dragged?.recurrence === 'weekday',
        recurring: dragged?.recurring,
        sourceId,
        start,
        type: 'move',
      })
      const result = await moveEvent({ day, sourceId, start })
      if (result.error) toast.error(result.error)
    })
  }

  // Pointer-drag on empty grid to create — click for a default hour, drag to size.
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

  return (
    <div className="relative select-none">
      {isPending ? (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-40 h-0.5 overflow-hidden">
          <div className="bg-accent h-full w-1/3" style={{ animation: 'loading-slide 0.9s ease-in-out infinite' }} />
        </div>
      ) : null}
      <div className="sticky top-0 z-20 grid min-w-[760px] grid-cols-[4.5rem_repeat(7,minmax(8.5rem,1fr))] border-b border-divider bg-surface/90 backdrop-blur dark:border-divider-dark dark:bg-surface-dark/90">
        <div />
        {week.days.map((day) => {
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
      <div className="grid min-w-[760px] grid-cols-[4.5rem_repeat(7,minmax(8.5rem,1fr))] pt-3">
        <div className="border-r border-divider dark:border-divider-dark">
          {HOURS.map((hour) => (
            <div className="relative h-[72px] pr-3 text-right" key={hour}>
              <span className="text-muted absolute -top-2 right-3 text-xs tabular-nums">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>
        {week.days.map((day) => {
          const isToday = day === todayKey
          const showNow = isToday && nowMinutes >= START_HOUR * 60 && nowMinutes <= END_MINUTES
          const dayEvents = optimisticEvents.filter((event) => event.day === day && !hidden.has(event.calendar))
          const layout = packDay(dayEvents)
          const selectionLo = createSel?.day === day ? Math.min(createSel.aMin, createSel.bMin) : null
          const selectionHi = createSel?.day === day ? Math.max(createSel.aMin, createSel.bMin) : null
          return (
            <div
              className={cn(
                'relative cursor-copy border-r border-divider dark:border-divider-dark',
                isToday && 'bg-accent/[0.035]',
              )}
              key={day}
              onDragOver={(event) => handleDragOver(day, event)}
              onDrop={(event) => handleDrop(day, event)}
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
                const top = ((timeToMinutes(event.start) - START_HOUR * 60) / 60) * HOUR_HEIGHT
                const height = Math.max(22, (event.duration / 60) * HOUR_HEIGHT - 3)
                const place = layout.get(event.id) ?? { col: 0, cols: 1 }
                const widthPct = 100 / place.cols
                return (
                  <button
                    className={cn(
                      'absolute z-10 flex flex-col overflow-hidden rounded-[5px] px-2 py-1 text-left ring-1 ring-inset transition-[filter,box-shadow] hover:z-20 hover:brightness-105 hover:shadow-md focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
                      'cursor-grab active:cursor-grabbing',
                      calendarChip[event.calendar],
                    )}
                    data-event-chip
                    draggable
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    onDragStart={(dragEvent) => {
                      dragEvent.dataTransfer.effectAllowed = 'move'
                      dragEvent.dataTransfer.setData('text/pace-event', event.sourceId)
                    }}
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
                      <span className="mt-0.5 text-[11px] tabular-nums opacity-70">{event.start}</span>
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
              {dropTarget?.day === day ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 z-50"
                  style={{ top: ((dropTarget.minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT }}
                >
                  <div className="relative h-0.5 rounded-full bg-accent ring-2 ring-surface dark:ring-surface-dark">
                    <span className="absolute -top-2.5 left-0 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white shadow-md">
                      {minutesToTime(dropTarget.minutes)}
                    </span>
                  </div>
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

export function CalendarBoardSkeleton() {
  return (
    <div className="min-w-[760px]">
      <div className="grid grid-cols-[4.5rem_repeat(7,minmax(8.5rem,1fr))] border-b border-divider dark:border-divider-dark">
        <div />
        {Array.from({ length: 7 }).map((_, index) => (
          <div className="px-3 py-2.5" key={index}>
            <Skeleton className="h-3 w-8" />
            <Skeleton className="mt-1.5 size-8 rounded-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[4.5rem_repeat(7,minmax(8.5rem,1fr))] pt-3">
        <div className="border-r border-divider dark:border-divider-dark" />
        {Array.from({ length: 7 }).map((_, dayIndex) => (
          <div className="relative border-r border-divider dark:border-divider-dark" style={{ height: GRID_HEIGHT }} key={dayIndex}>
            {HOURS.map((hour) => (
              <div className="h-[72px] border-b border-divider/60 dark:border-divider-dark/60" key={hour} />
            ))}
            {dayIndex % 2 === 0 ? (
              <Skeleton className="absolute inset-x-1 rounded-md" style={{ height: 64, top: 84 + dayIndex * 12 }} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
