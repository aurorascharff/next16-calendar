import type { CalendarEvent } from '../types/calendar';

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function matchesRecurrence(recurrence: string | null | undefined, day: string) {
  if (!recurrence) return false;
  const weekday = new Date(`${day}T00:00:00.000Z`).getUTCDay();
  return recurrence === 'weekday' ? weekday >= 1 && weekday <= 5 : recurrence === WEEKDAY_NAMES[weekday];
}

function moveRecurringEvent(events: CalendarEvent[], change: Extract<EventChange, { type: 'move' }>, days: string[]) {
  const event = events.find(candidate => candidate.id === change.id);
  if (!event?.recurrence) return applyEventChange(events, change);

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

export function expandOptimisticEvent(event: CalendarEvent, days: string[]) {
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

export type EventChange =
  | { event: CalendarEvent; type: 'create' }
  | { day: string; id: string; sourceId: string; start: string; type: 'move' }
  | { sourceId: string; type: 'delete' }
  | { duration: number; sourceId: string; type: 'resize' }
  | {
      event: Pick<CalendarEvent, 'allDay' | 'description' | 'duration' | 'sourceId' | 'start' | 'title'>;
      type: 'update';
    };

export const noPendingChanges: EventChange[] = [];

export function addPendingChange(changes: EventChange[], change: EventChange): EventChange[] {
  return [...changes, change];
}

export function applyEventChange(events: CalendarEvent[], change: EventChange) {
  switch (change.type) {
    case 'create':
      return [change.event, ...events.filter(event => event.id !== change.event.id)];
    case 'delete':
      return events.filter(event => event.sourceId !== change.sourceId);
    case 'resize':
      return events.map(event =>
        event.sourceId === change.sourceId ? { ...event, duration: change.duration } : event,
      );
    case 'update':
      return events.map(event => (event.sourceId === change.event.sourceId ? { ...event, ...change.event } : event));
    case 'move':
      return events.map(event => (event.id === change.id ? { ...event, day: change.day, start: change.start } : event));
  }
}

export function applyEventChanges(events: CalendarEvent[], changes: EventChange[], days: string[]) {
  return changes.reduce((current, change) => {
    if (change.type === 'move') return moveRecurringEvent(current, change, days);
    if (change.type !== 'create') return applyEventChange(current, change);

    return expandOptimisticEvent(change.event, days).reduce(
      (created, event) => applyEventChange(created, { event, type: 'create' }),
      current,
    );
  }, events);
}
