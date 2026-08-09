'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useOptimistic, useTransition } from 'react';
import { Boundary } from '@/components/internal/boundary';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { calendarHref, shiftMonth, shiftWeek } from '../calendar-utils';
import { useTodayKey } from '../hooks/use-now';
import { DatePicker } from './date-picker';
import type { CalendarView } from '../types/calendar';

export function CalendarControls({ date, view }: { date: string; view: CalendarView }) {
  const today = useTodayKey();
  const previous = view === 'month' ? shiftMonth(date, -1) : shiftWeek(date, -1);
  const next = view === 'month' ? shiftMonth(date, 1) : shiftWeek(date, 1);
  const period = view === 'month' ? 'month' : 'week';

  return (
    <Boundary label="CalendarControls" asChild>
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
            label={`Previous ${period}`}
            render={<Link href={calendarHref(previous, view)} prefetch transitionTypes={['nav-back']} />}
          >
            <ChevronLeft className="size-4.5" />
          </IconButton>
          <IconButton
            label={`Next ${period}`}
            render={<Link href={calendarHref(next, view)} prefetch transitionTypes={['nav-forward']} />}
          >
            <ChevronRight className="size-4.5" />
          </IconButton>
        </div>
        <DatePicker date={date} view={view} />
      </div>
    </Boundary>
  );
}

export function CalendarViewShortcuts({ date, view }: { date: string; view: CalendarView }) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.isComposing
      ) {
        return;
      }
      const target = event.target;
      if (
        document.querySelector('[data-calendar-editing]') ||
        (target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.closest(
              'input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"]',
            )))
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const nextView = key === 'w' ? 'week' : key === 'm' ? 'month' : null;
      if (!nextView || nextView === view) return;

      event.preventDefault();
      router.push(calendarHref(date, nextView));
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [date, router, view]);

  return null;
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
    <Boundary label="ViewToggle" asChild>
      <div className="border-divider dark:border-divider-dark flex items-center rounded-md border p-0.5">
        <Link
          aria-keyshortcuts="W"
          aria-current={optimisticView === 'week' ? 'page' : undefined}
          className={cn(item, optimisticView === 'week' ? active : inactive)}
          href={calendarHref(date, 'week')}
          onNavigate={() => markView('week')}
          prefetch
        >
          Week
        </Link>
        <Link
          aria-keyshortcuts="M"
          aria-current={optimisticView === 'month' ? 'page' : undefined}
          className={cn(item, optimisticView === 'month' ? active : inactive)}
          href={calendarHref(date, 'month')}
          onNavigate={() => markView('month')}
          prefetch
        >
          Month
        </Link>
      </div>
    </Boundary>
  );
}
