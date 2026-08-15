'use client';

import { useCalendarEvents } from '@/providers/calendar-events-provider';
import { eventChangeReducer } from '../utils/event-change-reducer';
import { matchesRecurrence, occurrenceId, recurrenceAfterMove } from '../utils/recurrence';
import type { CalendarEvent, EventChange } from '../types/calendar';

// The events from the server, with the changes whose saves are still running replayed over them.
export function useOptimisticEvents(events: CalendarEvent[], days: string[]) {
  const { pendingChanges } = useCalendarEvents();
  return applyEventChanges(events, pendingChanges, days);
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

function moveRecurringEvent(events: CalendarEvent[], change: Extract<EventChange, { type: 'move' }>, days: string[]) {
  const event = events.find(candidate => candidate.id === change.id);
  if (!event?.recurrence) return eventChangeReducer(events, change);

  const recurrence = recurrenceAfterMove(event.recurrence, change.day);

  // A weekday pattern keeps its days, so only the time moves.
  if (recurrence === 'weekday') {
    return events.map(candidate =>
      candidate.sourceId === change.sourceId ? { ...candidate, start: change.start } : candidate,
    );
  }

  const occurrences = days
    .filter(day => matchesRecurrence(recurrence, day))
    .map(day => ({
      ...event,
      day,
      id: occurrenceId(change.sourceId, day),
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
      id: occurrenceId(event.sourceId, day),
      recurring: true,
    }));
}
