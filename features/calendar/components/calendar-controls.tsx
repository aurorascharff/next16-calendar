'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useOptimistic, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { shiftDay, shiftWeek } from '../calendar-utils';
import { useTodayKey } from '../hooks/use-now';
import { DatePicker } from './date-picker';
import type { CalendarView } from '../types/calendar';
import type { Route } from 'next';

function calendarHref(date: string, view: CalendarView) {
  return `/calendar/${date}${view === 'day' ? '?view=day' : ''}` as Route;
}

export function CalendarControls({ date, view }: { date: string; view: CalendarView }) {
  const today = useTodayKey();
  const previous = view === 'day' ? shiftDay(date, -1) : shiftWeek(date, -1);
  const next = view === 'day' ? shiftDay(date, 1) : shiftWeek(date, 1);

  return (
    <div className="flex items-center gap-1">
      {today ? (
        <Button className="h-8 px-3" render={<Link href={calendarHref(today, view)} prefetch />} variant="ghost">
          Today
        </Button>
      ) : (
        <Button className="h-8 px-3" disabled variant="ghost">
          Today
        </Button>
      )}
      <div className="flex items-center">
        <IconButton
          label={view === 'day' ? 'Previous day' : 'Previous week'}
          render={<Link href={calendarHref(previous, view)} prefetch />}
        >
          <ChevronLeft className="size-4.5" />
        </IconButton>
        <IconButton
          label={view === 'day' ? 'Next day' : 'Next week'}
          render={<Link href={calendarHref(next, view)} prefetch />}
        >
          <ChevronRight className="size-4.5" />
        </IconButton>
      </div>
      <DatePicker date={date} />
    </div>
  );
}

export function ViewToggle({ date, view }: { date: string; view: CalendarView }) {
  const [optimisticView, setOptimisticView] = useOptimistic(view);
  const [, startTransition] = useTransition();
  const item = 'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-sm font-medium transition-colors';
  const active = 'bg-card dark:bg-card-dark text-black dark:text-white';
  const inactive = 'text-muted hover:text-black dark:hover:text-white';

  function markView(nextView: CalendarView) {
    if (nextView === optimisticView) return;
    startTransition(() => setOptimisticView(nextView));
  }

  return (
    <div className="border-divider dark:border-divider-dark flex items-center rounded-md border p-0.5">
      <Link
        aria-current={optimisticView === 'week' ? 'page' : undefined}
        className={cn(item, optimisticView === 'week' ? active : inactive)}
        href={calendarHref(date, 'week')}
        onNavigate={() => markView('week')}
        prefetch
      >
        Week
      </Link>
      <Link
        aria-current={optimisticView === 'day' ? 'page' : undefined}
        className={cn(item, optimisticView === 'day' ? active : inactive)}
        href={calendarHref(date, 'day')}
        onNavigate={() => markView('day')}
        prefetch
      >
        Day
      </Link>
    </div>
  );
}
