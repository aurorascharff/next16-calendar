export type CalendarView = 'month' | 'week';
export type CalendarColor =
  | 'rose'
  | 'orange'
  | 'amber'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'fuchsia'
  | 'magenta'
  | 'pink';

export type Calendar = {
  color: CalendarColor;
  id: string;
  name: string;
};

export type CalendarEvent = {
  allDay: boolean;
  calendarId: string;
  color: CalendarColor;
  day: string;
  description?: string | null;
  duration: number;
  id: string;
  isBooking?: boolean;
  recurrence?: string | null;
  recurring?: boolean;
  sourceId: string;
  start: string;
  title: string;
};

export type EventChange =
  | { event: CalendarEvent; type: 'create' }
  | { day: string; id: string; sourceId: string; start: string; type: 'move' }
  | { sourceId: string; type: 'delete' }
  | { duration: number; sourceId: string; type: 'resize' }
  | {
      event: Pick<CalendarEvent, 'allDay' | 'description' | 'duration' | 'sourceId' | 'start' | 'title'>;
      type: 'update';
    };

export type CalendarRange = {
  days: string[];
  events: CalendarEvent[];
  start: string;
};
