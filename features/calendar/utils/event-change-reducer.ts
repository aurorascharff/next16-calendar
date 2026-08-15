import type { CalendarEvent, EventChange } from '../types/calendar';

export function eventChangeReducer(events: CalendarEvent[], change: EventChange) {
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
