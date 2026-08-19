'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { calendarHref, getWeekDays, shiftMonth, shiftWeek } from '../calendar-utils';
import { useTodayKey } from './use-now';
import type { CalendarView } from '../types/calendar';

type CalendarTransitionType = 'nav-back' | 'nav-crossfade' | 'nav-forward';

const INTERACTIVE_SELECTOR =
  'input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"]';

function shouldIgnoreShortcut(event: KeyboardEvent) {
  if (
    event.defaultPrevented ||
    event.repeat ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.isComposing ||
    document.querySelector('[data-calendar-editing]')
  ) {
    return true;
  }

  const target = event.target;
  return target instanceof HTMLElement && (target.isContentEditable || Boolean(target.closest(INTERACTIVE_SELECTOR)));
}

export function useCalendarShortcuts({ date, view }: { date: string; view: CalendarView }) {
  const router = useRouter();
  const today = useTodayKey();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (shouldIgnoreShortcut(event)) return;

      const previous = view === 'month' ? shiftMonth(date, -1) : shiftWeek(date, -1);
      const next = view === 'month' ? shiftMonth(date, 1) : shiftWeek(date, 1);
      const key = event.key.toLowerCase();
      let destination: ReturnType<typeof calendarHref> | null = null;
      let transitionType: CalendarTransitionType = 'nav-crossfade';

      switch (key) {
        case 'w':
          destination = calendarHref(date, 'week');
          break;
        case 'm':
          destination = calendarHref(date, 'month');
          break;
        case 'arrowleft':
          destination = calendarHref(previous, view);
          transitionType = 'nav-back';
          break;
        case 'arrowright':
          destination = calendarHref(next, view);
          transitionType = 'nav-forward';
          break;
        case 't':
          destination =
            today && !(view === 'week' ? getWeekDays(date).includes(today) : date.slice(0, 7) === today.slice(0, 7))
              ? calendarHref(today, view)
              : null;
          break;
      }

      if (!destination || destination === calendarHref(date, view)) return;

      event.preventDefault();
      const focusedElement = document.activeElement;
      if (focusedElement instanceof HTMLElement && focusedElement.closest('[data-calendar-view-toggle]')) {
        focusedElement.blur();
      }
      router.push(destination, { transitionTypes: [transitionType] });
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [date, router, today, view]);
}
