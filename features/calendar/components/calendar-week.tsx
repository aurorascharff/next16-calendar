import { type ReactNode } from 'react';
import { DirectionalSlide } from '@/components/ui/directional-slide';
import { getCalendars, getCalendarWeek } from '../calendar-queries';
import { getWeekDays } from '../calendar-utils';
import { CalendarBoard, CalendarBoardSkeleton } from './calendar-board';
import { CalendarScrollSection } from './calendar-scroll-section';

export async function CalendarWeek({ date }: { date: string }) {
  const [week, calendars] = await Promise.all([getCalendarWeek(date), getCalendars()]);

  return <CalendarBoard calendars={calendars} days={week.days} events={week.events} />;
}

export function CalendarWeekSkeleton({ date }: { date?: string }) {
  const days = date ? getWeekDays(date) : undefined;

  return <CalendarBoardSkeleton days={days} />;
}

export function CalendarWeekScroll({ children, date }: { children: ReactNode; date?: string }) {
  const days = date ? getWeekDays(date) : undefined;

  return (
    <DirectionalSlide key={days ? `week:${days.join(',')}` : 'loading:week'} name="calendar-board">
      <CalendarScrollSection scrollKey={days ? `week:${days.join(',')}` : 'loading:week'}>
        {children}
      </CalendarScrollSection>
    </DirectionalSlide>
  );
}
