'use client';

import { createContext, startTransition, useActionState, useContext, useOptimistic, type ReactNode } from 'react';
import { toast } from 'sonner';
import { calendarEventsReducer } from '@/features/calendar/calendar-actions';
import type { CalendarEvent } from '@/features/calendar/types/calendar';
import {
  applyEventActions,
  applyOptimisticEventAction,
  initialEventMutationState,
} from '@/features/calendar/utils/event-optimistic-reducer';
import type { EventAction } from '@/features/calendar/utils/event-optimistic-reducer';
import type { EventMutationState } from '@/features/calendar/utils/event-optimistic-reducer';

type CalendarEventsContextValue = {
  getEvents: (events: CalendarEvent[], days: string[]) => CalendarEvent[];
  isPending: boolean;
  mutate: (action: EventAction) => void;
};

const CalendarEventsContext = createContext<CalendarEventsContextValue | null>(null);

async function reduceCalendarEvents(state: EventMutationState, action: EventAction) {
  const next = await calendarEventsReducer(state, action);
  if (next.notification?.type === 'error') {
    toast.error(next.notification.message);
  } else if (next.notification) {
    toast.success(next.notification.message);
  }
  return next;
}

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch, isPending] = useActionState(reduceCalendarEvents, initialEventMutationState);
  const [optimisticState, applyOptimisticAction] = useOptimistic(state, applyOptimisticEventAction);

  function mutate(action: EventAction) {
    startTransition(() => {
      applyOptimisticAction(action);
      dispatch(action);
    });
  }

  return (
    <CalendarEventsContext.Provider
      value={{
        getEvents: (events, days) => applyEventActions(events, optimisticState.actions, days),
        isPending,
        mutate,
      }}
    >
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
