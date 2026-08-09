'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition } from 'react'
import type { Route } from 'next'
import { cn } from '@/lib/utils'
import type { CalendarView } from '../types/calendar'
import { dateKey, shiftDay, shiftWeek } from '../calendar-utils'
import { DatePicker } from './date-picker'

const iconButton =
  'flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white'

function calendarHref(date: string, view: CalendarView) {
  return `/calendar/${date}${view === 'day' ? '?view=day' : ''}` as Route
}

export function CalendarControls({ date, view }: { date: string; view: CalendarView }) {
  const router = useRouter()
  const previous = view === 'day' ? shiftDay(date, -1) : shiftWeek(date, -1)
  const next = view === 'day' ? shiftDay(date, 1) : shiftWeek(date, 1)

  function goToday() {
    startTransition(() => router.push(calendarHref(dateKey(new Date()), view)))
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <button
          className="text-muted h-8 rounded-md px-3 text-sm font-medium transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white"
          onClick={goToday}
          type="button"
        >
          Today
        </button>
        <div className="flex items-center">
          <Link aria-label={view === 'day' ? 'Previous day' : 'Previous week'} className={iconButton} href={calendarHref(previous, view)} prefetch transitionTypes={['calendar-back']}>
            <ChevronLeft className="size-4.5" />
          </Link>
          <Link aria-label={view === 'day' ? 'Next day' : 'Next week'} className={iconButton} href={calendarHref(next, view)} prefetch transitionTypes={['calendar-forward']}>
            <ChevronRight className="size-4.5" />
          </Link>
        </div>
        <DatePicker date={date} />
      </div>
      <div className="border-divider flex items-center rounded-md border p-0.5 dark:border-divider-dark">
        <Link
          aria-current={view === 'week' ? 'page' : undefined}
          className={cn(
            'rounded px-2.5 py-1 text-sm font-medium transition-colors',
            view === 'week' ? 'bg-card text-black dark:bg-card-dark dark:text-white' : 'text-muted hover:text-black dark:hover:text-white',
          )}
          href={calendarHref(date, 'week')}
          prefetch
        >
          Week
        </Link>
        <Link
          aria-current={view === 'day' ? 'page' : undefined}
          className={cn(
            'rounded px-2.5 py-1 text-sm font-medium transition-colors',
            view === 'day' ? 'bg-card text-black dark:bg-card-dark dark:text-white' : 'text-muted hover:text-black dark:hover:text-white',
          )}
          href={calendarHref(date, 'day')}
          prefetch
        >
          Day
        </Link>
      </div>
    </div>
  )
}
