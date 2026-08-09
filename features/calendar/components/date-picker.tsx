'use client'

import * as Ariakit from '@ariakit/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { startTransition, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { dateKey } from '../calendar-utils'

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC', year: 'numeric' })
const triggerLabel = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC', year: 'numeric' })

function fromKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1))
  const offset = (first.getUTCDay() + 6) % 7
  const start = new Date(first)
  start.setUTCDate(first.getUTCDate() - offset)
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setUTCDate(start.getUTCDate() + index)
    return day
  })
}

export function DatePicker({ date }: { date: string }) {
  const router = useRouter()
  const selected = fromKey(date)
  const [view, setView] = useState(() => ({ month: selected.getUTCMonth(), year: selected.getUTCFullYear() }))
  const store = Ariakit.usePopoverStore()
  const open = Ariakit.useStoreState(store, 'open')

  useEffect(() => {
    if (open) setView({ month: selected.getUTCMonth(), year: selected.getUTCFullYear() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, date])

  const todayKey = dateKey(new Date())
  const days = monthGrid(view.year, view.month)

  function shiftMonth(delta: number) {
    setView((current) => {
      const next = new Date(Date.UTC(current.year, current.month + delta, 1))
      return { month: next.getUTCMonth(), year: next.getUTCFullYear() }
    })
  }

  function pick(day: Date) {
    store.hide()
    startTransition(() => router.push(`/calendar/${dateKey(day)}`))
  }

  return (
    <Ariakit.PopoverProvider store={store}>
      <Ariakit.PopoverDisclosure className="text-muted flex h-8 items-center gap-1.5 rounded px-2 text-sm font-medium tabular-nums transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white">
        {triggerLabel.format(selected)}
      </Ariakit.PopoverDisclosure>
      <Ariakit.Popover
        gutter={8}
        className="border-divider z-50 w-64 rounded-xl border bg-surface p-3 shadow-xl outline-none dark:border-divider-dark dark:bg-surface-dark"
      >
        <div className="mb-2 flex items-center justify-between">
          <button
            aria-label="Previous month"
            className="text-muted rounded p-1 transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white"
            onClick={() => shiftMonth(-1)}
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-semibold">{monthLabel.format(new Date(Date.UTC(view.year, view.month, 1)))}</span>
          <button
            aria-label="Next month"
            className="text-muted rounded p-1 transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white"
            onClick={() => shiftMonth(1)}
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="text-muted mb-1 grid grid-cols-7 text-center text-[11px] font-medium">
          {WEEKDAY_LABELS.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const key = dateKey(day)
            const isSelected = key === date
            const isToday = key === todayKey
            const isOutside = day.getUTCMonth() !== view.month
            return (
              <button
                className={cn(
                  'grid size-8 place-items-center rounded-md text-sm tabular-nums transition-colors',
                  isSelected
                    ? 'bg-accent font-semibold text-white'
                    : 'hover:bg-card dark:hover:bg-card-dark',
                  !isSelected && isToday && 'text-accent font-semibold',
                  !isSelected && isOutside && 'text-muted/50',
                )}
                key={key}
                onClick={() => pick(day)}
                type="button"
              >
                {day.getUTCDate()}
              </button>
            )
          })}
        </div>
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  )
}
