'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useOptimistic, useTransition } from 'react';
import { Boundary } from '@/components/internal/boundary';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { calendarHref, getWeekDays, shiftMonth, shiftWeek } from '../calendar-utils';
import { useCalendarShortcuts } from '../hooks/use-calendar-shortcuts';
import { useTodayKey } from '../hooks/use-now';
import type { CalendarView } from '../types/calendar';

export function CalendarControls({ date, view }: { date: string; view: CalendarView }) {
  const today = useTodayKey();
  const previous = view === 'month' ? shiftMonth(date, -1) : shiftWeek(date, -1);
  const next = view === 'month' ? shiftMonth(date, 1) : shiftWeek(date, 1);
  const period = view === 'month' ? 'month' : 'week';
  const todayIsInCurrentRange = today
    ? view === 'week'
      ? getWeekDays(date).includes(today)
      : date.slice(0, 7) === today.slice(0, 7)
    : false;

  return (
    <Boundary label="CalendarControls" asChild>
      <div className="flex items-center gap-1">
        {today && !todayIsInCurrentRange ? (
          <Button
            aria-keyshortcuts="T"
            className="h-8 px-3"
            render={<Link href={calendarHref(today, view)} prefetch transitionTypes={['nav-crossfade']} />}
            variant="ghost"
          >
            Today
          </Button>
        ) : (
          <Button className="h-8 px-3" disabled variant="ghost">
            Today
          </Button>
        )}
        <div className="flex items-center">
          <IconButton
            aria-keyshortcuts="ArrowLeft"
            label={`Previous ${period}`}
            render={<Link href={calendarHref(previous, view)} prefetch transitionTypes={['nav-back']} />}
          >
            <ChevronLeft className="size-4.5" />
          </IconButton>
          <IconButton
            aria-keyshortcuts="ArrowRight"
            label={`Next ${period}`}
            render={<Link href={calendarHref(next, view)} prefetch transitionTypes={['nav-forward']} />}
          >
            <ChevronRight className="size-4.5" />
          </IconButton>
        </div>
      </div>
    </Boundary>
  );
}

export function CalendarShortcuts({ date, view }: { date: string; view: CalendarView }) {
  useCalendarShortcuts({ date, view });
  return null;
}

export function ViewToggle({ date, view }: { date: string; view: CalendarView }) {
  const [optimisticView, setOptimisticView] = useOptimistic(view);
  const [, startTransition] = useTransition();
  const item =
    'inline-flex size-8 items-center justify-center gap-1.5 rounded-sm text-sm font-medium transition-colors sm:h-auto sm:w-auto sm:px-2.5 sm:py-1';
  const active = 'bg-card dark:bg-card-dark text-black dark:text-white';
  const inactive = 'text-muted hover:text-black dark:hover:text-white';

  function markView(nextView: CalendarView) {
    if (nextView === optimisticView) return;
    startTransition(() => setOptimisticView(nextView));
  }

  return (
    <Boundary label="ViewToggle" asChild>
      <div
        className="border-divider dark:border-divider-dark flex items-center rounded-md border p-0.5"
        data-calendar-view-toggle
      >
        <Link
          aria-keyshortcuts="W"
          aria-current={optimisticView === 'week' ? 'page' : undefined}
          className={cn(item, optimisticView === 'week' ? active : inactive)}
          href={calendarHref(date, 'week')}
          onNavigate={() => markView('week')}
          prefetch
          transitionTypes={['nav-crossfade']}
        >
          <span className="sm:hidden">W</span>
          <span className="hidden sm:inline">Week</span>
        </Link>
        <Link
          aria-keyshortcuts="M"
          aria-current={optimisticView === 'month' ? 'page' : undefined}
          className={cn(item, optimisticView === 'month' ? active : inactive)}
          href={calendarHref(date, 'month')}
          onNavigate={() => markView('month')}
          prefetch
          transitionTypes={['nav-crossfade']}
        >
          <span className="sm:hidden">M</span>
          <span className="hidden sm:inline">Month</span>
        </Link>
      </div>
    </Boundary>
  );
}
