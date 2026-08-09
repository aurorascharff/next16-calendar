'use client';

import { createContext, useContext, useState } from 'react';

type CalendarVisibility = {
  hidden: ReadonlySet<string>;
  toggle: (calendarId: string) => void;
};

const CalendarVisibilityContext = createContext<CalendarVisibility | null>(null);

export function CalendarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());

  function toggle(calendarId: string) {
    setHidden(current => {
      const next = new Set(current);
      if (next.has(calendarId)) next.delete(calendarId);
      else next.add(calendarId);
      return next;
    });
  }

  return <CalendarVisibilityContext.Provider value={{ hidden, toggle }}>{children}</CalendarVisibilityContext.Provider>;
}

export function useCalendarVisibility() {
  const context = useContext(CalendarVisibilityContext);
  if (!context) throw new Error('useCalendarVisibility must be used within CalendarVisibilityProvider');
  return context;
}
