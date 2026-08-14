import { eventChangeReducer } from './event-change-reducer';
import { matchesRecurrence, WEEKDAY_NAMES } from './recurrence';
import type { CalendarEvent, EventChange } from '../types/calendar';

export function applyEventChanges(events: CalendarEvent[], changes: EventChange[], days: string[]) {
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
