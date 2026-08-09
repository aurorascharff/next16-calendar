import { getCalendars, getCalendarWeek } from '../calendar-queries';
import { getWeekDays } from '../calendar-utils';
import { CalendarBoard, CalendarBoardSkeleton } from './calendar-board';
import { CalendarScrollSection } from './calendar-scroll-section';
import type { CalendarView } from '../types/calendar';

export async function CalendarWeek({ date, view }: { date: string; view: CalendarView }) {
  const [week, calendars] = await Promise.all([getCalendarWeek(date), getCalendars()]);
  const days = view === 'day' ? [date] : week.days;

  return (
    <CalendarScrollSection scrollKey={`${view}:${days.join(',')}`}>
      <CalendarBoard calendars={calendars} days={days} events={week.events} view={view} />
    </CalendarScrollSection>
  );
}

export function CalendarWeekSkeleton({ date, view = 'week' }: { date?: string; view?: CalendarView }) {
  const days = date ? (view === 'day' ? [date] : getWeekDays(date)) : undefined;

  return (
    <CalendarScrollSection scrollKey={days ? `${view}:${days.join(',')}` : `loading:${view}`}>
      <CalendarBoardSkeleton days={days} fallbackCount={view === 'day' ? 1 : 7} />
    </CalendarScrollSection>
  );
}
