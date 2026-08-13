'use client';

import {
  createContext,
  startTransition,
  useActionState,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  type ReactNode,
} from 'react';
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

type CalendarEventsStateContextValue = {
  getEvents: (events: CalendarEvent[], days: string[]) => CalendarEvent[];
  isPending: boolean;
};

type CalendarEventsDispatchContextValue = (action: EventAction) => void;

const CalendarEventsStateContext = createContext<CalendarEventsStateContextValue | null>(null);
const CalendarEventsDispatchContext = createContext<CalendarEventsDispatchContextValue | null>(null);

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

  const mutate = useCallback(
    (action: EventAction) => {
      startTransition(() => {
        applyOptimisticAction(action);
        dispatch(action);
      });
    },
    [applyOptimisticAction, dispatch],
  );
  const getEvents = useCallback(
    (events: CalendarEvent[], days: string[]) => applyEventActions(events, optimisticState.actions, days),
    [optimisticState.actions],
  );
  const contextValue = useMemo(() => ({ getEvents, isPending }), [getEvents, isPending]);

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
