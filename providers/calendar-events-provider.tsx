'use client';

import { createContext, useContext, useOptimistic, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { createEvent } from '@/features/calendar/calendar-actions';
import type { CalendarEvent } from '@/features/calendar/types/calendar';

type CalendarEventsContextValue = {
  createdEvents: CalendarEvent[];
  create: (event: CalendarEvent, save: () => ReturnType<typeof createEvent>) => Promise<void>;
};

const CalendarEventsContext = createContext<CalendarEventsContextValue | null>(null);

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const [createdEvents, addCreatedEvent] = useOptimistic<CalendarEvent[], CalendarEvent>([], (events, event) => [
    event,
    ...events,
  ]);
  const [isPending, setPending] = useOptimistic(false);

  async function create(event: CalendarEvent, save: () => ReturnType<typeof createEvent>) {
    addCreatedEvent(event);
    setPending(true);

    const result = await save();
    if (result.error) {
      toast.error(result.error);
    } else if (!result.data) {
      toast.error('Event was saved, but the response was empty.');
    }
  }

  return (
    <CalendarEventsContext.Provider value={{ create, createdEvents }}>
      {children}
      {isPending ? (
        <span className="sr-only" data-calendar-pending role="status">
          Saving calendar changes
        </span>
      ) : null}
    </CalendarEventsContext.Provider>
  );
}

export function useCalendarEvents() {
  const context = useContext(CalendarEventsContext);
  if (!context) throw new Error('useCalendarEvents must be used within CalendarEventsProvider');
  return context;
}
