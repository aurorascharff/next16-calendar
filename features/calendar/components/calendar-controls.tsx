'use client';

import * as Ariakit from '@ariakit/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import { Boundary } from '@/components/internal/boundary';
import { Button } from '@/components/ui/button';
import { HoverPrefetchLink } from '@/components/ui/hover-prefetch-link';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { calendarHref, dateKey, shiftMonth, shiftWeek } from '../calendar-utils';
import { useCalendarShortcuts } from '../hooks/use-calendar-shortcuts';
import { useTodayKey } from '../hooks/use-now';
import type { CalendarView } from '../types/calendar';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC', year: 'numeric' });
const triggerLabel = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

function fromKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const start = new Date(first);
  start.setUTCDate(first.getUTCDate() - offset);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);
    return day;
  });
}

export function CalendarControls({
  date,
  showDatePicker = true,
  view,
}: {
  date: string;
  showDatePicker?: boolean;
  view: CalendarView;
}) {
  const today = useTodayKey();
  const previous = view === 'month' ? shiftMonth(date, -1) : shiftWeek(date, -1);
  const next = view === 'month' ? shiftMonth(date, 1) : shiftWeek(date, 1);
  const period = view === 'month' ? 'month' : 'week';

  return (
    <Boundary label="CalendarControls" asChild>
      <div className="flex items-center gap-1">
        {today ? (
          <Button
            aria-keyshortcuts="T"
            className="h-8 px-3"
            render={<Link href={calendarHref(today, view)} prefetch />}
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
        {showDatePicker ? <DatePicker date={date} view={view} /> : null}
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

export function DatePicker({
  date,
  label = 'date',
  view,
}: {
  date: string;
  label?: 'date' | 'month';
  view: CalendarView;
}) {
  const selected = fromKey(date);
  const store = Ariakit.usePopoverStore();

  return (
    <Ariakit.PopoverProvider store={store}>
      <Ariakit.PopoverDisclosure
        aria-label="Choose a date"
        className={cn(
          'hover:bg-card dark:hover:bg-card-dark flex h-8 shrink-0 items-center justify-center rounded px-2 font-medium tabular-nums transition-colors hover:text-black dark:hover:text-white',
          label === 'month' ? 'text-lg font-semibold tracking-tight sm:hidden' : 'text-muted w-[7.5rem] text-sm',
        )}
      >
        {label === 'month' ? monthLabel.format(selected) : triggerLabel.format(selected)}
      </Ariakit.PopoverDisclosure>
      <Ariakit.Popover
        className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark z-50 w-64 rounded-xl border p-3 shadow-xl outline-none"
        gutter={8}
      >
        <DatePickerCalendar date={date} onPick={() => store.hide()} view={view} />
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  );
}

function DatePickerCalendar({
  date,
  onPick,
  view: calendarView,
}: {
  date: string;
  onPick: () => void;
  view: CalendarView;
}) {
  const selected = fromKey(date);
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    month: selected.getUTCMonth(),
    year: selected.getUTCFullYear(),
  }));
  const todayKey = useTodayKey();
  const days = monthGrid(visibleMonth.year, visibleMonth.month);

  function changeVisibleMonth(delta: number) {
    setVisibleMonth(current => {
      const next = new Date(Date.UTC(current.year, current.month + delta, 1));
      return { month: next.getUTCMonth(), year: next.getUTCFullYear() };
    });
  }

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <IconButton label="Previous month" onClick={() => changeVisibleMonth(-1)} size="sm">
          <ChevronLeft className="size-4" />
        </IconButton>
        <HoverPrefetchLink
          className="text-sm font-semibold transition-colors hover:text-black dark:hover:text-white"
          href={calendarHref(dateKey(new Date(Date.UTC(visibleMonth.year, visibleMonth.month, 1))), 'month')}
          onNavigate={onPick}
        >
          {monthLabel.format(new Date(Date.UTC(visibleMonth.year, visibleMonth.month, 1)))}
        </HoverPrefetchLink>
        <IconButton label="Next month" onClick={() => changeVisibleMonth(1)} size="sm">
          <ChevronRight className="size-4" />
        </IconButton>
      </div>
      <div className="text-muted mb-1 grid grid-cols-7 text-center text-[11px] font-medium">
        {WEEKDAY_LABELS.map((weekday, index) => (
          <span key={index}>{weekday}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(day => {
          const key = dateKey(day);
          const isSelected = key === date;
          const isToday = key === todayKey;
          const isOutside = day.getUTCMonth() !== visibleMonth.month;
          return (
            <HoverPrefetchLink
              className={cn(
                'relative grid size-8 place-items-center rounded-md text-sm tabular-nums',
                isSelected ? 'bg-action font-semibold text-white' : 'hover:bg-card dark:hover:bg-card-dark',
                !isSelected && isToday && 'font-semibold text-black dark:text-white',
                !isSelected && isOutside && 'text-muted/50',
              )}
              href={calendarHref(key, calendarView)}
              key={key}
              onNavigate={onPick}
            >
              {day.getUTCDate()}
            </HoverPrefetchLink>
          );
        })}
      </div>
    </>
  );
}
