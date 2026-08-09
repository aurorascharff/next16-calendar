'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { CalendarName } from '../types/calendar'

type CalendarVisibility = {
  hidden: ReadonlySet<CalendarName>
  toggle: (name: CalendarName) => void
}

const CalendarVisibilityContext = createContext<CalendarVisibility | null>(null)

export function CalendarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState<ReadonlySet<CalendarName>>(() => new Set())

  const toggle = useCallback((name: CalendarName) => {
    setHidden((current) => {
      const next = new Set(current)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])

  const value = useMemo(() => ({ hidden, toggle }), [hidden, toggle])
  return <CalendarVisibilityContext.Provider value={value}>{children}</CalendarVisibilityContext.Provider>
}

export function useCalendarVisibility() {
  const context = useContext(CalendarVisibilityContext)
  if (!context) throw new Error('useCalendarVisibility must be used within CalendarVisibilityProvider')
  return context
}

export const CALENDAR_META: Record<CalendarName, { dot: string; label: string }> = {
  focus: { dot: 'bg-indigo-500', label: 'Focus' },
  personal: { dot: 'bg-rose-500', label: 'Personal' },
  team: { dot: 'bg-accent', label: 'Team' },
}

export const CALENDAR_ORDER: CalendarName[] = ['focus', 'team', 'personal']
