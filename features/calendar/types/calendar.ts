export type CalendarView = 'day' | 'week';
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
  isDemo: boolean;
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
  isDemo: boolean;
  recurrence?: string | null;
  recurring?: boolean;
  sourceId: string;
  start: string;
  title: string;
};

export type CalendarWeek = {
  days: string[];
  events: CalendarEvent[];
  start: string;
};
