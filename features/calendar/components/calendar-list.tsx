import { getCalendars } from '@/features/calendar/calendar-queries';
import { CalendarManager } from './calendar-manager';

export async function CalendarList() {
  const calendars = await getCalendars();
  return <CalendarManager calendars={calendars} />;
}
