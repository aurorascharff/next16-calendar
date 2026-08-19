'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useOptimistic, useState, useTransition } from 'react';
import { Boundary } from '@/components/internal/boundary';
import { HoverPrefetchLink } from '@/components/ui/hover-prefetch-link';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { calendarHref, dateKey, getWeekDays } from '../calendar-utils';
import { useTodayKey } from '../hooks/use-now';
import type { CalendarView } from '../types/calendar';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC', year: 'numeric' });

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

function monthOf(dateKeyValue: string) {
  const base = new Date(`${dateKeyValue}T00:00:00.000Z`);
  return { month: base.getUTCMonth(), year: base.getUTCFullYear() };
}

export function MiniMonth() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = pathname.match(/\/calendar\/(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
  const calendarView: CalendarView = searchParams.get('view') === 'month' ? 'month' : 'week';
  const today = useTodayKey();
  const initialKey = selected ?? today;

  if (!initialKey) return <MiniMonthSkeleton />;

  return (
    <MiniMonthCalendar
      calendarView={calendarView}
      initialKey={initialKey}
      key={`${initialKey}:${calendarView}`}
      selected={selected}
      today={today}
    />
  );
}

export function MiniMonthSkeleton() {
  return (
    <div aria-hidden className="h-[233px]">
      <div className="mb-2 flex h-7 items-center">
        <span className="bg-divider/55 dark:bg-divider-dark/70 h-3 w-20 rounded-full" />
      </div>
      <div className="mb-1 h-[15px]" />
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: 42 }, (_, index) => (
          <span className="grid h-7 place-items-center" key={index}>
            <span className="bg-divider/45 dark:bg-divider-dark/65 size-2 rounded-full" />
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniMonthCalendar({
  calendarView,
  initialKey,
  selected,
  today,
}: {
  calendarView: CalendarView;
  initialKey: string;
  selected: string | null;
  today: string | null;
}) {
  const [optimisticSelected, setOptimisticSelected] = useOptimistic(selected);
  const [, startTransition] = useTransition();
  const weekDays = optimisticSelected ? getWeekDays(optimisticSelected) : null;
  const weekSet = weekDays ? new Set(weekDays) : null;
  const firstKey = weekDays?.[0];
  const lastKey = weekDays?.[6];
  const [monthView, setMonthView] = useState(() => monthOf(initialKey));
  const view = monthView;

  function shiftMonth(delta: number) {
    setMonthView(current => {
      const next = new Date(Date.UTC(current.year, current.month + delta, 1));
      return { month: next.getUTCMonth(), year: next.getUTCFullYear() };
    });
  }

  const days = monthGrid(view.year, view.month);

  return (
    <Boundary label="MiniMonth" asChild>
      <div className="h-[233px]">
        <div className="mb-2 flex items-center justify-between">
          <HoverPrefetchLink
            className="text-sm font-semibold transition-colors hover:text-black dark:hover:text-white"
            href={calendarHref(dateKey(new Date(Date.UTC(view.year, view.month, 1))), 'month')}
            transitionTypes={['nav-crossfade']}
          >
            {monthLabel.format(new Date(Date.UTC(view.year, view.month, 1)))}
          </HoverPrefetchLink>
          <div className="flex items-center gap-0.5">
            <IconButton label="Previous month" onClick={() => shiftMonth(-1)} size="sm">
              <ChevronLeft className="size-4" />
            </IconButton>
            <IconButton label="Next month" onClick={() => shiftMonth(1)} size="sm">
              <ChevronRight className="size-4" />
            </IconButton>
          </div>
        </div>
        <div className="text-muted mb-1 grid grid-cols-7 text-center text-[10px] font-medium">
          {WEEKDAY_LABELS.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {days.map(day => {
            const key = dateKey(day);
            const isToday = key === today;
            const inWeek = calendarView === 'week' && weekSet?.has(key);
            const isOutside = day.getUTCMonth() !== view.month;
            const inCurrentRange =
              !isOutside && (calendarView === 'week' ? inWeek : key.slice(0, 7) === optimisticSelected?.slice(0, 7));
            const className = cn(
              'relative grid h-7 w-full place-items-center text-xs tabular-nums',
              inWeek && 'bg-divider/70 dark:bg-divider-dark/80',
              inWeek && key === firstKey && 'rounded-l-full',
              inWeek && key === lastKey && 'rounded-r-full',
            );
            const dateLabel = (
              <span
                className={cn(
                  'grid size-7 place-items-center rounded-full',
                  isToday && 'bg-action font-semibold text-white',
                  !isToday && !inCurrentRange && 'hover:bg-divider/80 dark:hover:bg-divider-dark',
                  !isToday && isOutside && 'text-muted/40',
                )}
              >
                {day.getUTCDate()}
              </span>
            );

            if (inCurrentRange) {
              return (
                <span className={className} key={key}>
                  {dateLabel}
                </span>
              );
            }

            return (
              <HoverPrefetchLink
                className={className}
                href={calendarHref(key, calendarView)}
                key={key}
                onNavigate={() => {
                  if (key === optimisticSelected) return;
                  startTransition(() => setOptimisticSelected(key));
                }}
                transitionTypes={['nav-crossfade']}
              >
                {dateLabel}
              </HoverPrefetchLink>
            );
          })}
        </div>
      </div>
    </Boundary>
  );
}
