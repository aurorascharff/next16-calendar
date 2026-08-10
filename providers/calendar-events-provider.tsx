'use client';

import {
  createContext,
  useActionState,
  useContext,
  useOptimistic,
  useTransition,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import type { createEvent } from '@/features/calendar/calendar-actions';
import type { CalendarEvent } from '@/features/calendar/types/calendar';
import { applyEventAction } from '@/features/calendar/utils/event-optimistic-reducer';
import type { EventAction } from '@/features/calendar/utils/event-optimistic-reducer';

type CreateRequest = {
  event: CalendarEvent;
  save: () => ReturnType<typeof createEvent>;
};

type CalendarEventsContextValue = {
  createdEvents: CalendarEvent[];
  create: (event: CalendarEvent, save: () => ReturnType<typeof createEvent>) => void;
};

const CalendarEventsContext = createContext<CalendarEventsContextValue | null>(null);

async function saveCreatedEvent(events: CalendarEvent[], { event, save }: CreateRequest) {
  const result = await save();
  if (result.error) {
    toast.error(result.error);
    return events;
  }
  if (!result.data) {
    toast.error('Event was saved, but the response was empty.');
    return events;
  }

  return applyEventAction(events, {
    event: { ...event, id: result.data.id, sourceId: result.data.id },
    type: 'create',
  });
}

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const [savedEvents, saveEvent, isPending] = useActionState(saveCreatedEvent, [] as CalendarEvent[]);
  const [createdEvents, applyOptimisticEvent] = useOptimistic<CalendarEvent[], EventAction>(
    savedEvents,
    applyEventAction,
  );
  const [, startTransition] = useTransition();

  function create(event: CalendarEvent, save: () => ReturnType<typeof createEvent>) {
    startTransition(() => {
      applyOptimisticEvent({ event, type: 'create' });
      saveEvent({ event, save });
    });
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
