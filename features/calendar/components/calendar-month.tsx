import { type ReactNode } from 'react';
import { DirectionalSlide } from '@/components/ui/directional-slide';
import { getCalendars, getCalendarMonth } from '../calendar-queries';
import { getMonthDays } from '../calendar-utils';
import { CalendarMonthBoard, CalendarMonthFrame } from './calendar-month-board';
import { CalendarBoardViewport } from './calendar-scroll-section';

export async function CalendarMonth({ date }: { date: string }) {
  const [calendarMonth, calendars] = await Promise.all([getCalendarMonth(date), getCalendars()]);

  return <CalendarMonthBoard calendars={calendars} days={calendarMonth.days} events={calendarMonth.events} />;
}

export function CalendarMonthSurface({ children, date }: { children: ReactNode; date: string }) {
  return (
    <CalendarMonthFrame date={date} days={getMonthDays(date)}>
      {children}
    </CalendarMonthFrame>
  );
}

export function CalendarMonthEventsFallback() {
  return (
    <span className="sr-only" role="status">
      Loading calendar events
    </span>
  );
}

export function CalendarMonthScroll({ children, date }: { children: ReactNode; date?: string }) {
  return (
    <DirectionalSlide key={date ? `month:${date.slice(0, 7)}` : 'loading:month'} name="calendar-board">
      <CalendarBoardViewport>
        <section className="min-h-0 flex-1 overflow-auto overscroll-contain [overflow-anchor:none]">{children}</section>
      </CalendarBoardViewport>
    </DirectionalSlide>
  );
}
