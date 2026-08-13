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
import {
  createEvent,
  deleteEvent,
  moveEvent,
  resizeEvent,
  updateEvent,
} from '@/features/calendar/calendar-actions';
import type { CalendarEvent } from '@/features/calendar/types/calendar';
import {
  addPendingChange,
  applyEventChanges,
  noPendingChanges,
} from '@/features/calendar/utils/event-optimistic-reducer';
import type { EventChange } from '@/features/calendar/utils/event-optimistic-reducer';

type CalendarEventsStateContextValue = {
  getEvents: (events: CalendarEvent[], days: string[]) => CalendarEvent[];
  isPending: boolean;
};

type CalendarEventsDispatchContextValue = (change: EventChange) => void;

const CalendarEventsStateContext = createContext<CalendarEventsStateContextValue | null>(null);
const CalendarEventsDispatchContext = createContext<CalendarEventsDispatchContextValue | null>(null);

function save(change: EventChange) {
  switch (change.type) {
    case 'create':
      return createEvent({
        allDay: change.event.allDay,
        calendarId: change.event.calendarId || undefined,
        day: change.event.day,
        description: change.event.description ?? undefined,
        duration: change.event.duration,
        recurrence: change.event.recurrence,
        start: change.event.start,
        title: change.event.title,
      });
    case 'delete':
      return deleteEvent(change.sourceId);
    case 'move':
      return moveEvent({ day: change.day, sourceId: change.sourceId, start: change.start });
    case 'resize':
      return resizeEvent({ duration: change.duration, sourceId: change.sourceId });
    case 'update':
      return updateEvent({
        allDay: change.event.allDay,
        description: change.event.description ?? undefined,
        duration: change.event.duration,
        eventId: change.event.sourceId,
        start: change.event.start,
        title: change.event.title,
      });
  }
}

async function saveChange(_pending: EventChange[], change: EventChange): Promise<EventChange[]> {
  const result = await save(change);
  if (result.error) {
    toast.error(result.error);
  } else if (change.type === 'delete') {
    toast.success('Event removed.');
  } else if (change.type === 'update') {
    toast.success('Event updated.');
  }

  return noPendingChanges;
}

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const [changes, dispatch, isPending] = useActionState(saveChange, noPendingChanges);
  const [optimisticChanges, addOptimisticChange] = useOptimistic(changes, addPendingChange);

  const mutate = useCallback(
    (change: EventChange) => {
      startTransition(() => {
        addOptimisticChange(change);
        dispatch(change);
      });
    },
    [addOptimisticChange, dispatch],
  );
  const getEvents = useCallback(
    (events: CalendarEvent[], days: string[]) => applyEventChanges(events, optimisticChanges, days),
    [optimisticChanges],
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
