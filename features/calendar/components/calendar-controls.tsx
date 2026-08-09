'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { shiftDay, shiftWeek } from '../calendar-utils';
import { useTodayKey } from '../hooks/use-now';
import { DatePicker } from './date-picker';
import type { CalendarView } from '../types/calendar';
import type { Route } from 'next';

const iconButton =
  'flex size-8 items-center justify-center rounded-md text-muted hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white';

function calendarHref(date: string, view: CalendarView) {
  return `/calendar/${date}${view === 'day' ? '?view=day' : ''}` as Route;
}

export function CalendarControls({ date, view }: { date: string; view: CalendarView }) {
  const today = useTodayKey();
  const previous = view === 'day' ? shiftDay(date, -1) : shiftWeek(date, -1);
  const next = view === 'day' ? shiftDay(date, 1) : shiftWeek(date, 1);

  const todayButton =
    'text-muted inline-flex h-8 items-center rounded-md px-3 text-sm font-medium hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white';

  return (
    <div className="flex items-center gap-1">
      {today ? (
        <Link className={todayButton} href={calendarHref(today, view)} prefetch>
          Today
        </Link>
      ) : (
        <span className={cn(todayButton, 'opacity-50')}>Today</span>
      )}
      <div className="flex items-center">
        <Link
          aria-label={view === 'day' ? 'Previous day' : 'Previous week'}
          className={iconButton}
          href={calendarHref(previous, view)}
          prefetch
          transitionTypes={['calendar-back']}
        >
          <ChevronLeft className="size-4.5" />
        </Link>
        <Link
          aria-label={view === 'day' ? 'Next day' : 'Next week'}
          className={iconButton}
          href={calendarHref(next, view)}
          prefetch
          transitionTypes={['calendar-forward']}
        >
          <ChevronRight className="size-4.5" />
        </Link>
      </div>
      <DatePicker date={date} />
    </div>
  );
}

export function ViewToggle({ date, view }: { date: string; view: CalendarView }) {
  return (
    <div className="border-divider dark:border-divider-dark flex items-center rounded-md border p-0.5">
      <Link
        aria-current={view === 'week' ? 'page' : undefined}
        className={cn(
          'rounded px-2.5 py-1 text-sm font-medium transition-colors',
          view === 'week'
            ? 'bg-card dark:bg-card-dark text-black dark:text-white'
            : 'text-muted hover:text-black dark:hover:text-white',
        )}
        href={calendarHref(date, 'week')}
        prefetch
      >
        Week
      </Link>
      <Link
        aria-current={view === 'day' ? 'page' : undefined}
        className={cn(
          'rounded px-2.5 py-1 text-sm font-medium transition-colors',
          view === 'day'
            ? 'bg-card dark:bg-card-dark text-black dark:text-white'
            : 'text-muted hover:text-black dark:hover:text-white',
        )}
        href={calendarHref(date, 'day')}
        prefetch
      >
        Day
      </Link>
    </div>
  );
}
