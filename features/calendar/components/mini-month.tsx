'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useOptimistic, useState, useTransition } from 'react';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { dateKey, getWeekDays } from '../calendar-utils';
import { useTodayKey } from '../hooks/use-now';
import type { Route } from 'next';

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
  return (
    <Suspense fallback={<div aria-hidden className="h-[232px]" />}>
      <MiniMonthInner />
    </Suspense>
  );
}

function MiniMonthInner() {
  const pathname = usePathname();
  const selected = pathname.match(/\/calendar\/(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
  const today = useTodayKey();
  const initialKey = selected ?? today;

  if (!initialKey) return <div aria-hidden className="h-[232px]" />;

  return <MiniMonthCalendar initialKey={initialKey} key={initialKey} selected={selected} today={today} />;
}

function MiniMonthCalendar({
  initialKey,
  selected,
  today,
}: {
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
      const base = current ?? view!;
      const next = new Date(Date.UTC(base.year, base.month + delta, 1));
      return { month: next.getUTCMonth(), year: next.getUTCFullYear() };
    });
  }

  const days = monthGrid(view.year, view.month);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">{monthLabel.format(new Date(Date.UTC(view.year, view.month, 1)))}</span>
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
          const inWeek = weekSet?.has(key);
          const isOutside = day.getUTCMonth() !== view.month;
          return (
            <Link
              className={cn(
                'relative grid h-7 w-full place-items-center text-xs tabular-nums',
                inWeek && 'bg-divider/70 dark:bg-divider-dark/80',
                inWeek && key === firstKey && 'rounded-l-md',
                inWeek && key === lastKey && 'rounded-r-md',
              )}
              href={`/calendar/${key}` as Route}
              key={key}
              onNavigate={() => {
                if (key === optimisticSelected) return;
                startTransition(() => setOptimisticSelected(key));
              }}
              prefetch={inWeek ? true : undefined}
            >
              <span
                className={cn(
                  'grid size-7 place-items-center rounded-md',
                  isToday && 'bg-accent font-semibold text-white',
                  !isToday && 'hover:bg-divider/80 dark:hover:bg-divider-dark',
                  !isToday && isOutside && 'text-muted/40',
                )}
              >
                {day.getUTCDate()}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
