'use client';

import * as Ariakit from '@ariakit/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { HoverPrefetchLink } from '@/components/ui/hover-prefetch-link';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { calendarHref, dateKey } from '../calendar-utils';
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

export function DatePicker({ date, view }: { date: string; view: CalendarView }) {
  const selected = fromKey(date);
  const store = Ariakit.usePopoverStore();

  return (
    <Ariakit.PopoverProvider store={store}>
      <Ariakit.PopoverDisclosure className="text-muted hover:bg-card dark:hover:bg-card-dark flex h-8 w-[7.5rem] shrink-0 items-center justify-center rounded px-2 text-sm font-medium tabular-nums transition-colors hover:text-black dark:hover:text-white">
        {triggerLabel.format(selected)}
      </Ariakit.PopoverDisclosure>
      <Ariakit.Popover
        gutter={8}
        className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark z-50 w-64 rounded-xl border p-3 shadow-xl outline-none"
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

  function shiftMonth(delta: number) {
    setVisibleMonth(current => {
      const next = new Date(Date.UTC(current.year, current.month + delta, 1));
      return { month: next.getUTCMonth(), year: next.getUTCFullYear() };
    });
  }

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <IconButton label="Previous month" onClick={() => shiftMonth(-1)} size="sm">
          <ChevronLeft className="size-4" />
        </IconButton>
        <span className="text-sm font-semibold">
          {monthLabel.format(new Date(Date.UTC(visibleMonth.year, visibleMonth.month, 1)))}
        </span>
        <IconButton label="Next month" onClick={() => shiftMonth(1)} size="sm">
          <ChevronRight className="size-4" />
        </IconButton>
      </div>
      <div className="text-muted mb-1 grid grid-cols-7 text-center text-[11px] font-medium">
        {WEEKDAY_LABELS.map((label, index) => (
          <span key={index}>{label}</span>
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
                isSelected ? 'bg-accent font-semibold text-white' : 'hover:bg-card dark:hover:bg-card-dark',
                !isSelected && isToday && 'text-accent font-semibold',
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
