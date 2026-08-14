'use client';

import { createContext, startTransition, useActionState, useContext, useOptimistic, type ReactNode } from 'react';
import { toast } from 'sonner';
import { saveEventChange } from '@/features/calendar/calendar-actions';
import type { CalendarEvent, EventChange } from '@/features/calendar/types/calendar';
import { applyEventChanges } from '@/features/calendar/utils/apply-event-changes';

type CalendarEventsStateContextValue = {
  getEvents: (events: CalendarEvent[], days: string[]) => CalendarEvent[];
  isPending: boolean;
};

type CalendarEventsDispatchContextValue = (change: EventChange) => void;

const CalendarEventsStateContext = createContext<CalendarEventsStateContextValue | null>(null);
const CalendarEventsDispatchContext = createContext<CalendarEventsDispatchContextValue | null>(null);

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const [, dispatch, isPending] = useActionState(async (_: void, change: EventChange) => {
    const result = await saveEventChange(change);
    if (result.error) {
      toast.error(result.error);
    } else if (change.type === 'delete') {
      toast.success('Event removed.');
    } else if (change.type === 'update') {
      toast.success('Event updated.');
    }
  }, undefined);
  const [pendingChanges, addOptimisticChange] = useOptimistic<EventChange[], EventChange>([], (changes, change) => [
    ...changes,
    change,
  ]);

  function mutate(change: EventChange) {
    startTransition(() => {
      addOptimisticChange(change);
      dispatch(change);
    });
  }

  function getEvents(events: CalendarEvent[], days: string[]) {
    return applyEventChanges(events, pendingChanges, days);
  }

  const contextValue = { getEvents, isPending };

  return (
    <CalendarEventsStateContext.Provider value={contextValue}>
      <CalendarEventsDispatchContext.Provider value={mutate}>{children}</CalendarEventsDispatchContext.Provider>
    </CalendarEventsStateContext.Provider>
  );
}

export function useCalendarEvents() {
  const context = useContext(CalendarEventsStateContext);
  if (!context) throw new Error('useCalendarEvents must be used within CalendarEventsProvider');
  return context;
}

export function useCalendarEventsDispatch() {
  const context = useContext(CalendarEventsDispatchContext);
  if (!context) throw new Error('useCalendarEventsDispatch must be used within CalendarEventsProvider');
  return context;
}
