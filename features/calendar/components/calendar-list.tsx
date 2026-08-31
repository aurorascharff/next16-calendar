import { getCalendars } from '@/features/calendar/calendar-queries';
import { CalendarManager, CalendarManagerSkeleton } from './calendar-manager';

export async function CalendarList({ expanded = false }: { expanded?: boolean }) {
  const calendars = await getCalendars();
  return <CalendarManager calendars={calendars} expanded={expanded} />;
}

export function CalendarListFallback({ expanded = false }: { expanded?: boolean }) {
  return (
    <div className="h-full [scrollbar-gutter:stable] overflow-y-auto overscroll-contain pb-6">
      <CalendarManagerSkeleton expanded={expanded} />
    </div>
  );
}
