import { getCalendars, getCalendarWeek } from '../calendar-queries';
import { getWeekDays } from '../calendar-utils';
import { CalendarBoard, CalendarBoardSkeleton } from './calendar-board';
import type { CalendarView } from '../types/calendar';

export async function CalendarWeek({ date, view }: { date: string; view: CalendarView }) {
  const [week, calendars] = await Promise.all([getCalendarWeek(date), getCalendars()]);
  const days = view === 'day' ? [date] : week.days;

  return (
    <section className="min-h-0 flex-1 overflow-auto" data-calendar-scroll>
      <CalendarBoard calendars={calendars} days={days} events={week.events} view={view} />
    </section>
  );
}

export function CalendarWeekSkeleton({ date, view = 'week' }: { date?: string; view?: CalendarView }) {
  const days = date ? (view === 'day' ? [date] : getWeekDays(date)) : undefined;

  return (
    <section className="min-h-0 flex-1 overflow-auto" data-calendar-scroll>
      <CalendarBoardSkeleton days={days} fallbackCount={view === 'day' ? 1 : 7} />
    </section>
  );
}
