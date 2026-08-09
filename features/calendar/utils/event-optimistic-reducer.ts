import type { CalendarEvent } from '../types/calendar';

export type EventAction =
  | { event: CalendarEvent; type: 'create' }
  | { day: string; id: string; start: string; type: 'move' }
  | { sourceId: string; type: 'delete' }
  | { duration: number; sourceId: string; type: 'resize' }
  | {
      event: Pick<CalendarEvent, 'allDay' | 'description' | 'duration' | 'sourceId' | 'start' | 'title'>;
      type: 'update';
    };

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
