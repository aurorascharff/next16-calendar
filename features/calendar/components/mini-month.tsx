'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { startTransition, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { dateKey, getWeekDays } from '../calendar-utils'

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC', year: 'numeric' })

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

export function MiniMonth() {
  const router = useRouter()
  const pathname = usePathname()
  const selected = pathname.match(/\/calendar\/(\d{4}-\d{2}-\d{2})/)?.[1]
  const weekDays = selected ? getWeekDays(selected) : null
  const weekSet = weekDays ? new Set(weekDays) : null
  const firstKey = weekDays?.[0]
  const lastKey = weekDays?.[6]
  const [today, setToday] = useState<string | null>(null)
  const [view, setView] = useState<{ month: number; year: number } | null>(null)

  useEffect(() => {
    setToday(dateKey(new Date()))
  }, [])

  useEffect(() => {
    const base = selected ? new Date(`${selected}T00:00:00.000Z`) : new Date()
    setView({ month: base.getUTCMonth(), year: base.getUTCFullYear() })
  }, [selected])

  if (!view) return <div className="h-[232px]" aria-hidden />

  function shiftMonth(delta: number) {
    setView((current) => {
      if (!current) return current
      const next = new Date(Date.UTC(current.year, current.month + delta, 1))
      return { month: next.getUTCMonth(), year: next.getUTCFullYear() }
    })
  }

  function pick(day: Date) {
    startTransition(() => router.push(`/calendar/${dateKey(day)}`))
  }

  const days = monthGrid(view.year, view.month)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">{monthLabel.format(new Date(Date.UTC(view.year, view.month, 1)))}</span>
        <div className="flex items-center gap-0.5">
          <button
            aria-label="Previous month"
            className="text-muted rounded p-1 transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white"
            onClick={() => shiftMonth(-1)}
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            aria-label="Next month"
            className="text-muted rounded p-1 transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white"
            onClick={() => shiftMonth(1)}
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="text-muted mb-1 grid grid-cols-7 text-center text-[10px] font-medium">
        {WEEKDAY_LABELS.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day) => {
          const key = dateKey(day)
          const isToday = key === today
          const inWeek = weekSet?.has(key)
          const isOutside = day.getUTCMonth() !== view.month
          return (
            <button
              className={cn(
                'grid size-7 place-items-center text-xs tabular-nums transition-colors',
                isToday && 'z-10 rounded-md bg-accent font-semibold text-white',
                !isToday && inWeek && 'bg-card dark:bg-card-dark',
                !isToday && inWeek && key === firstKey && 'rounded-l-md',
                !isToday && inWeek && key === lastKey && 'rounded-r-md',
                !isToday && !inWeek && 'rounded-md hover:bg-card dark:hover:bg-card-dark',
                !isToday && isOutside && 'text-muted/40',
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
    </div>
  )
}
