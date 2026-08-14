'use client';

import { createContext, startTransition, useActionState, useContext, useOptimistic, type ReactNode } from 'react';
import { toast } from 'sonner';
import { saveEventChange } from '@/features/calendar/calendar-actions';
import type { CalendarEvent, EventChange } from '@/features/calendar/types/calendar';
import { eventChangeReducer } from '@/features/calendar/utils/event-change-reducer';

type CalendarEventsStateContextValue = {
  getEvents: (events: CalendarEvent[], days: string[]) => CalendarEvent[];
  isPending: boolean;
};

type CalendarEventsDispatchContextValue = (change: EventChange) => void;

const CalendarEventsStateContext = createContext<CalendarEventsStateContextValue | null>(null);
const CalendarEventsDispatchContext = createContext<CalendarEventsDispatchContextValue | null>(null);

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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

function matchesRecurrence(recurrence: string | null | undefined, day: string) {
  if (!recurrence) return false;
  const weekday = new Date(`${day}T00:00:00.000Z`).getUTCDay();
  return recurrence === 'weekday' ? weekday >= 1 && weekday <= 5 : recurrence === WEEKDAY_NAMES[weekday];
}

function moveRecurringEvent(events: CalendarEvent[], change: Extract<EventChange, { type: 'move' }>, days: string[]) {
  const event = events.find(candidate => candidate.id === change.id);
  if (!event?.recurrence) return eventChangeReducer(events, change);

  if (event.recurrence === 'weekday') {
    return events.map(candidate =>
      candidate.sourceId === change.sourceId ? { ...candidate, start: change.start } : candidate,
    );
  }

  const recurrence = WEEKDAY_NAMES[new Date(`${change.day}T00:00:00.000Z`).getUTCDay()];
  const occurrences = days
    .filter(day => matchesRecurrence(recurrence, day))
    .map(day => ({
      ...event,
      day,
      id: `${change.sourceId}:${day}`,
      recurrence,
      recurring: true,
      start: change.start,
    }));

  return [...occurrences, ...events.filter(candidate => candidate.sourceId !== change.sourceId)];
}

function expandOptimisticEvent(event: CalendarEvent, days: string[]) {
  if (!event.recurrence) return [event];

  return days
    .filter(day => matchesRecurrence(event.recurrence, day))
    .map(day => ({
      ...event,
      day,
      id: `${event.sourceId}:${day}`,
      recurring: true,
    }));
}

function applyEventChanges(events: CalendarEvent[], changes: EventChange[], days: string[]) {
  return changes.reduce((current, change) => {
    if (change.type === 'move') return moveRecurringEvent(current, change, days);
    if (change.type !== 'create') return eventChangeReducer(current, change);

    return expandOptimisticEvent(change.event, days).reduce(
      (created, event) => eventChangeReducer(created, { event, type: 'create' }),
      current,
    );
  }, events);
}
