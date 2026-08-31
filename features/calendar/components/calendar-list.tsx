import { getCalendars } from '@/features/calendar/calendar-queries';
import { CalendarManager, CalendarManagerSkeleton } from './calendar-manager';
import type { ReactNode } from 'react';

export async function CalendarList({ expanded = false }: { expanded?: boolean }) {
  const calendars = await getCalendars();
  return (
    <CalendarListViewport>
      <CalendarManager calendars={calendars} expanded={expanded} />
    </CalendarListViewport>
  );
}

export function CalendarListFallback({ expanded = false }: { expanded?: boolean }) {
  return (
    <CalendarListViewport>
      <CalendarManagerSkeleton expanded={expanded} />
    </CalendarListViewport>
  );
}

function CalendarListViewport({ children }: { children: ReactNode }) {
  return <div className="h-full [scrollbar-gutter:stable] overflow-y-auto overscroll-contain pb-6">{children}</div>;
}
