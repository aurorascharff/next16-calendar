import { type ReactNode } from 'react';
import { DirectionalSlide } from '@/components/ui/directional-slide';
import { getCalendars, getCalendarWeek } from '../calendar-queries';
import { getWeekDays } from '../calendar-utils';
import { CalendarBoard, CalendarBoardFrame } from './calendar-board';
import { CalendarBoardViewport, CalendarScrollSection } from './calendar-scroll-section';

export async function CalendarWeek({ date }: { date: string }) {
  const [week, calendars] = await Promise.all([getCalendarWeek(date), getCalendars()]);

  return <CalendarBoard calendars={calendars} days={week.days} events={week.events} />;
}

export function CalendarWeekFrame({ children, date }: { children: ReactNode; date: string }) {
  return <CalendarBoardFrame days={getWeekDays(date)}>{children}</CalendarBoardFrame>;
}

export function CalendarWeekEventsFallback() {
  return (
    <span className="sr-only" role="status">
      Loading calendar events
    </span>
  );
}

export function CalendarWeekScroll({ children, date }: { children: ReactNode; date?: string }) {
  const days = date ? getWeekDays(date) : undefined;

  return (
    <DirectionalSlide key={days ? `week:${days.join(',')}` : 'loading:week'} name="calendar-board">
      <CalendarBoardViewport>
        <CalendarScrollSection scrollKey={days ? `week:${days.join(',')}` : 'loading:week'}>
          {children}
        </CalendarScrollSection>
      </CalendarBoardViewport>
    </DirectionalSlide>
  );
}
