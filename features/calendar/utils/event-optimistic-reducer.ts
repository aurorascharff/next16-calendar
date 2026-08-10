import type { CalendarEvent } from '../types/calendar';

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function matchesRecurrence(recurrence: string | null | undefined, day: string) {
  if (!recurrence) return false;
  const weekday = new Date(`${day}T00:00:00.000Z`).getUTCDay();
  return recurrence === 'weekday' ? weekday >= 1 && weekday <= 5 : recurrence === WEEKDAY_NAMES[weekday];
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

export type EventAction =
  | { event: CalendarEvent; type: 'create' }
  | { day: string; id: string; sourceId: string; start: string; type: 'move' }
  | { sourceId: string; type: 'delete' }
  | { duration: number; sourceId: string; type: 'resize' }
  | {
      event: Pick<CalendarEvent, 'allDay' | 'description' | 'duration' | 'sourceId' | 'start' | 'title'>;
      type: 'update';
    };

export type EventMutationState = {
  actions: EventAction[];
  notification: { message: string; type: 'error' | 'success' } | null;
};

export const initialEventMutationState: EventMutationState = {
  actions: [],
  notification: null,
};

export function applyOptimisticEventAction(state: EventMutationState, action: EventAction): EventMutationState {
  return {
    actions: [...state.actions, action],
    notification: null,
  };
}

export function applyEventAction(events: CalendarEvent[], action: EventAction) {
  switch (action.type) {
    case 'create':
      return [action.event, ...events.filter(event => event.id !== action.event.id)];
    case 'delete':
      return events.filter(event => event.sourceId !== action.sourceId);
    case 'resize':
      return events.map(event =>
        event.sourceId === action.sourceId ? { ...event, duration: action.duration } : event,
      );
    case 'update':
      return events.map(event => (event.sourceId === action.event.sourceId ? { ...event, ...action.event } : event));
    case 'move':
      return events.map(event => (event.id === action.id ? { ...event, day: action.day, start: action.start } : event));
  }
}

export function applyEventActions(events: CalendarEvent[], actions: EventAction[], days: string[]) {
  return actions.reduce((current, action) => {
    if (action.type !== 'create') return applyEventAction(current, action);

    return expandOptimisticEvent(action.event, days).reduce(
      (created, event) => applyEventAction(created, { event, type: 'create' }),
      current,
    );
  }, events);
}
