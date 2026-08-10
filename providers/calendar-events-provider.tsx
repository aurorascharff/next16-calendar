'use client';

import { createContext, useContext, useOptimistic, useTransition, type ReactNode } from 'react';
import { toast } from 'sonner';
import { createEvent, deleteEvent, moveEvent, resizeEvent, updateEvent } from '@/features/calendar/calendar-actions';
import type { CalendarEvent } from '@/features/calendar/types/calendar';
import { applyEventActions } from '@/features/calendar/utils/event-optimistic-reducer';
import type { EventAction } from '@/features/calendar/utils/event-optimistic-reducer';

type CalendarEventsContextValue = {
  getEvents: (events: CalendarEvent[], days: string[]) => CalendarEvent[];
  mutate: (action: EventAction) => Promise<boolean>;
};

const CalendarEventsContext = createContext<CalendarEventsContextValue | null>(null);

function saveEventAction(action: EventAction) {
  switch (action.type) {
    case 'create':
      return createEvent({
        allDay: action.event.allDay,
        calendarId: action.event.calendarId || undefined,
        day: action.event.day,
        description: action.event.description ?? undefined,
        duration: action.event.duration,
        recurrence: action.event.recurrence,
        start: action.event.start,
        title: action.event.title,
      });
    case 'delete':
      return deleteEvent(action.sourceId);
    case 'move':
      return moveEvent({ day: action.day, sourceId: action.sourceId, start: action.start });
    case 'resize':
      return resizeEvent({ duration: action.duration, sourceId: action.sourceId });
    case 'update':
      return updateEvent({
        allDay: action.event.allDay,
        description: action.event.description ?? undefined,
        duration: action.event.duration,
        eventId: action.event.sourceId,
        start: action.event.start,
        title: action.event.title,
      });
  }
}

function successMessage(action: EventAction) {
  switch (action.type) {
    case 'delete':
      return 'Event removed.';
    case 'update':
      return 'Event updated.';
    default:
      return null;
  }
}

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const [optimisticActions, applyOptimisticAction] = useOptimistic<EventAction[], EventAction>(
    [],
    (actions, action) => [...actions, action],
  );
  const [isPending, startTransition] = useTransition();

  function mutate(action: EventAction) {
    return new Promise<boolean>(resolve => {
      startTransition(async () => {
        applyOptimisticAction(action);

        try {
          const result = await saveEventAction(action);
          if (result.error) {
            toast.error(result.error);
            resolve(false);
            return;
          }

          const message = successMessage(action);
          if (message) toast.success(message);
          resolve(true);
        } catch {
          toast.error('Calendar change could not be saved.');
          resolve(false);
        }
      });
    });
  }

  return (
    <CalendarEventsContext.Provider
      value={{
        getEvents: (events, days) => applyEventActions(events, optimisticActions, days),
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
