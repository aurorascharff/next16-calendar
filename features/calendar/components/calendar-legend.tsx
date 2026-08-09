'use client'

import { cn } from '@/lib/utils'
import { CALENDAR_META, CALENDAR_ORDER, useCalendarVisibility } from './calendar-visibility'

export function CalendarLegend() {
  const { hidden, toggle } = useCalendarVisibility()

  return (
    <div className="space-y-0.5">
      {CALENDAR_ORDER.map((name) => {
        const meta = CALENDAR_META[name]
        const isHidden = hidden.has(name)
        return (
          <button
            aria-pressed={!isHidden}
            className="text-muted flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white"
            key={name}
            onClick={() => toggle(name)}
            type="button"
          >
            <span className={cn('size-2.5 rounded-full transition-opacity', meta.dot, isHidden && 'opacity-25')} />
            <span className={cn('transition-colors', isHidden && 'text-muted/60 line-through')}>{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}
