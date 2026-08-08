'use client'

import { GripVertical } from 'lucide-react'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { moveEvent } from '../calendar-actions'
import type { CalendarEvent, CalendarWeek } from '../calendar-types'
import { formatDay, timeToMinutes } from '../calendar-utils'

const HOUR_HEIGHT = 72
const START_HOUR = 8
const HOURS = Array.from({ length: 11 }, (_, index) => START_HOUR + index)

const colorClasses = {
  amber: 'border-amber-400/40 bg-amber-400/12 text-amber-100',
  blue: 'border-blue-400/40 bg-blue-400/12 text-blue-100',
  rose: 'border-rose-400/40 bg-rose-400/12 text-rose-100',
  violet: 'border-violet-400/40 bg-violet-400/12 text-violet-100',
}

function eventPosition(event: CalendarEvent) {
  const top = ((timeToMinutes(event.start) - START_HOUR * 60) / 60) * HOUR_HEIGHT
  return { height: (event.duration / 60) * HOUR_HEIGHT, top }
}

export function CalendarBoard({ week }: { week: CalendarWeek }) {
  const [optimisticEvents, setOptimisticEvents] = useOptimistic(
    week.events,
    (current, next: { day: string; eventId: string; start: string }) =>
      current.map((event) =>
        event.id === next.eventId ? { ...event, day: next.day, start: next.start } : event,
      ),
  )
  const [isPending, startTransition] = useTransition()

  function handleDrop(day: string, event: React.DragEvent<HTMLDivElement>) {
    const eventId = event.dataTransfer.getData('text/dayline-event')
    if (!eventId) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const offset = Math.max(0, event.clientY - bounds.top)
    const minutes = Math.min(18 * 60, START_HOUR * 60 + Math.round(offset / HOUR_HEIGHT) * 60)
    const start = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:00`

    startTransition(async () => {
      setOptimisticEvents({ day, eventId, start })
      const result = await moveEvent({ day, eventId, start })
      if (result.error) toast.error(result.error)
    })
  }

  return (
    <div className={isPending ? 'opacity-80' : undefined}>
      <div className="grid min-w-[760px] grid-cols-[4.5rem_repeat(7,minmax(8.5rem,1fr))] border-b border-divider dark:border-divider-dark">
        <div />
        {week.days.map((day) => (
          <div className="px-3 py-3" key={day}>
            <p className="text-muted text-xs font-medium uppercase">{formatDay(day).split(' ')[0]}</p>
            <p className="mt-1 text-lg font-semibold">{formatDay(day).split(' ')[1]}</p>
          </div>
        ))}
      </div>
      <div className="grid min-w-[760px] grid-cols-[4.5rem_repeat(7,minmax(8.5rem,1fr))]">
        <div className="border-r border-divider dark:border-divider-dark">
          {HOURS.map((hour) => (
            <div className="relative h-[72px] pr-3 text-right" key={hour}>
              <span className="text-muted absolute top-[-9px] right-3 text-xs tabular-nums">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>
        {week.days.map((day) => (
          <div
            className="relative h-[792px] border-r border-divider bg-surface/30 dark:border-divider-dark dark:bg-black/10"
            key={day}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(day, event)}
          >
            {HOURS.map((hour) => (
              <div className="h-[72px] border-b border-divider/70 dark:border-divider-dark/70" key={hour} />
            ))}
            {optimisticEvents
              .filter((event) => event.day === day)
              .map((event) => {
                const position = eventPosition(event)
                return (
                  <div
                    className={`absolute right-1 left-1 z-10 overflow-hidden rounded-md border px-2 py-1.5 shadow-sm ${colorClasses[event.color]}`}
                    draggable
                    key={event.id}
                    onDragStart={(dragEvent) => {
                      dragEvent.dataTransfer.effectAllowed = 'move'
                      dragEvent.dataTransfer.setData('text/dayline-event', event.id)
                    }}
                    style={position}
                  >
                    <div className="flex items-start gap-1">
                      <GripVertical className="mt-0.5 size-3 shrink-0 opacity-60" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{event.title}</p>
                        <p className="mt-0.5 text-[11px] opacity-80">{event.start}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CalendarBoardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden">
      <div className="h-16 border-b border-divider dark:border-divider-dark" />
      <div className="h-[792px] bg-[linear-gradient(to_right,transparent_0,transparent_8.5%,rgba(120,120,120,.08)_8.5%,rgba(120,120,120,.08)_8.6%,transparent_8.6%)]" />
    </div>
  )
}
