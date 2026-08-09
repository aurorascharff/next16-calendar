'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { dateKey, getWeekDays } from '../calendar-utils';
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
  const pathname = usePathname();
  const selected = pathname.match(/\/calendar\/(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
  const weekDays = selected ? getWeekDays(selected) : null;
  const weekSet = weekDays ? new Set(weekDays) : null;
  const firstKey = weekDays?.[0];
  const lastKey = weekDays?.[6];
  const [today, setToday] = useState<string | null>(null);
  const [monthView, setMonthView] = useState<{ month: number; year: number } | null>(() =>
    selected ? monthOf(selected) : null,
  );

  useEffect(() => {
    setToday(dateKey(new Date()));
  }, []);

  useEffect(() => {
    if (selected) setMonthView(monthOf(selected));
  }, [selected]);

  useEffect(() => {
    setMonthView(current => current ?? monthOf(dateKey(new Date())));
  }, []);

  const view = monthView ?? (selected ? monthOf(selected) : null);
  if (!view) return <div aria-hidden className="h-[232px]" />;

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
          <button
            aria-label="Previous month"
            className="text-muted hover:bg-card dark:hover:bg-card-dark rounded p-1 hover:text-black dark:hover:text-white"
            onClick={() => shiftMonth(-1)}
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            aria-label="Next month"
            className="text-muted hover:bg-card dark:hover:bg-card-dark rounded p-1 hover:text-black dark:hover:text-white"
            onClick={() => shiftMonth(1)}
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
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
                inWeek && 'bg-card dark:bg-card-dark',
                inWeek && key === firstKey && 'rounded-l-md',
                inWeek && key === lastKey && 'rounded-r-md',
              )}
              href={`/calendar/${key}` as Route}
              key={key}
              prefetch={inWeek ? true : undefined}
            >
              <span
                className={cn(
                  'grid size-7 place-items-center rounded-md',
                  isToday && 'bg-accent font-semibold text-white',
                  !isToday && !inWeek && 'hover:bg-card dark:hover:bg-card-dark',
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
