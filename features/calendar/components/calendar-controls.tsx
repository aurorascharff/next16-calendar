'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link, { useLinkStatus } from 'next/link';
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
          transitionTypes={['nav-back']}
        >
          <PendingGlimmer>
            <ChevronLeft className="size-4.5" />
          </PendingGlimmer>
        </Link>
        <Link
          aria-label={view === 'day' ? 'Next day' : 'Next week'}
          className={iconButton}
          href={calendarHref(next, view)}
          prefetch
          transitionTypes={['nav-forward']}
        >
          <PendingGlimmer>
            <ChevronRight className="size-4.5" />
          </PendingGlimmer>
        </Link>
      </div>
      <DatePicker date={date} />
    </div>
  );
}

export function ViewToggle({ date, view }: { date: string; view: CalendarView }) {
  const item = 'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-sm font-medium transition-colors';
  const active = 'bg-card dark:bg-card-dark text-black dark:text-white';
  const inactive = 'text-muted hover:text-black dark:hover:text-white';

  return (
    <div className="border-divider dark:border-divider-dark flex items-center rounded-md border p-0.5">
      <Link
        aria-current={view === 'week' ? 'page' : undefined}
        className={cn(item, view === 'week' ? active : inactive)}
        href={calendarHref(date, 'week')}
        prefetch
      >
        <PendingGlimmer>Week</PendingGlimmer>
      </Link>
      <Link
        aria-current={view === 'day' ? 'page' : undefined}
        className={cn(item, view === 'day' ? active : inactive)}
        href={calendarHref(date, 'day')}
        prefetch
      >
        <PendingGlimmer>Day</PendingGlimmer>
      </Link>
    </div>
  );
}

function PendingGlimmer({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <span className={cn('inline-flex items-center gap-1.5', pending && 'text-accent animate-pulse')}>{children}</span>
  );
}
