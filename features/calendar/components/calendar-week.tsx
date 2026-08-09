import { type ReactNode, ViewTransition } from 'react';
import { getCalendars, getCalendarWeek } from '../calendar-queries';
import { getWeekDays } from '../calendar-utils';
import { CalendarBoard, CalendarBoardSkeleton } from './calendar-board';
import { CalendarScrollSection } from './calendar-scroll-section';
import type { CalendarView } from '../types/calendar';

const boardSlide = {
  'nav-back': 'nav-back',
  'nav-forward': 'nav-forward',
  default: 'none',
};

export async function CalendarWeek({ date, view }: { date: string; view: CalendarView }) {
  const [week, calendars] = await Promise.all([getCalendarWeek(date), getCalendars()]);
  const days = view === 'day' ? [date] : week.days;

  return (
    <ViewTransition
      default="none"
      key={`${view}:${days.join(',')}`}
      name="calendar-board"
      share={boardSlide}
    >
      <CalendarBoard calendars={calendars} days={days} events={week.events} view={view} />
    </ViewTransition>
  );
}

export function CalendarWeekSkeleton({ date, view = 'week' }: { date?: string; view?: CalendarView }) {
  const days = date ? (view === 'day' ? [date] : getWeekDays(date)) : undefined;

  return <CalendarBoardSkeleton days={days} fallbackCount={view === 'day' ? 1 : 7} />;
}

export function CalendarWeekScroll({
  children,
  date,
  view,
}: {
  children: ReactNode;
  date?: string;
  view: CalendarView;
}) {
  const days = date ? (view === 'day' ? [date] : getWeekDays(date)) : undefined;

  return (
    <CalendarScrollSection scrollKey={days ? `${view}:${days.join(',')}` : `loading:${view}`}>
      {children}
    </CalendarScrollSection>
  );
}
