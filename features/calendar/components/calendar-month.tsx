import { type ReactNode } from 'react';
import { DirectionalSlide } from '@/components/ui/directional-slide';
import { cn } from '@/lib/utils';
import { getCalendars, getCalendarMonth } from '../calendar-queries';
import { getMonthDays } from '../calendar-utils';
import { CalendarMonthBoard } from './calendar-month-board';
import { CalendarBoardViewport } from './calendar-scroll-section';

export async function CalendarMonth({ date }: { date: string }) {
  const [calendarMonth, calendars] = await Promise.all([getCalendarMonth(date), getCalendars()]);

  return (
    <CalendarMonthBoard calendars={calendars} date={date} days={calendarMonth.days} events={calendarMonth.events} />
  );
}

export function CalendarMonthSkeleton({ date }: { date?: string }) {
  const days = date ? getMonthDays(date) : Array.from({ length: 42 }, () => null);
  const month = date?.slice(0, 7);

  return (
    <div className="flex min-h-full min-w-[760px] flex-col" role="status" aria-label="Loading month">
      <div className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark grid grid-cols-7 border-b">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(label => (
          <div
            className="text-muted border-divider dark:border-divider-dark border-r px-2 py-2 text-center text-[11px] font-semibold uppercase"
            key={label}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid auto-rows-[11rem] grid-cols-7">
        {days.map((day, index) => (
          <div
            className={cn(
              'border-divider dark:border-divider-dark border-r border-b p-1.5',
              day && month && !day.startsWith(month) && 'bg-card/25 dark:bg-card-dark/20',
            )}
            key={day ?? index}
          >
            {day ? (
              <div className="mb-0.5 flex h-7 items-center pl-1">
                <span className="text-muted grid size-6 place-items-center text-xs font-medium tabular-nums">
                  {Number(day.slice(-2))}
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalendarMonthScroll({ children, date }: { children: ReactNode; date?: string }) {
  return (
    <DirectionalSlide key={date ? `month:${date.slice(0, 7)}` : 'loading:month'} name="calendar-board">
      <CalendarBoardViewport>
        <section className="min-h-0 flex-1 overflow-auto [overflow-anchor:none]">{children}</section>
      </CalendarBoardViewport>
    </DirectionalSlide>
  );
}
