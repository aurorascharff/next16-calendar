import { RouteTransition } from '@/components/ui/route-transition';
import { getCalendars, getCalendarWeek } from '../calendar-queries';
import { CalendarBoard, CalendarBoardSkeleton } from './calendar-board';
import type { CalendarView } from '../types/calendar';

export async function CalendarWeek({ date, view }: { date: string; view: CalendarView }) {
  const [week, calendars] = await Promise.all([getCalendarWeek(date), getCalendars()]);
  const days = view === 'day' ? [date] : week.days;

  return (
    <RouteTransition slideKey={date}>
      <section className="min-h-0 flex-1 overflow-auto" data-calendar-scroll>
        <CalendarBoard calendars={calendars} days={days} events={week.events} view={view} />
      </section>
    </RouteTransition>
  );
}

export function CalendarWeekSkeleton({ view = 'week' }: { view?: CalendarView }) {
  return (
    <section className="min-h-0 flex-1 overflow-auto" data-calendar-scroll>
      <CalendarBoardSkeleton days={view === 'day' ? 1 : 7} />
    </section>
  );
}
