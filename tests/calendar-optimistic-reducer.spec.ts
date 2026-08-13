import { expect, test } from '@playwright/test';
import type { CalendarEvent } from '@/features/calendar/types/calendar';
import { applyEventChanges } from '@/features/calendar/utils/event-optimistic-reducer';

function recurringEvent(day: string, recurrence: string): CalendarEvent {
  return {
    allDay: false,
    calendarId: 'calendar',
    color: 'blue',
    day,
    duration: 60,
    id: `series:${day}`,
    recurrence,
    recurring: true,
    sourceId: 'series',
    start: '08:30',
    title: 'Recurring event',
  };
}

test('moving a weekday occurrence updates the whole series optimistically', () => {
  const days = ['2026-08-10', '2026-08-11', '2026-08-12'];
  const events = days.map(day => recurringEvent(day, 'weekday'));

  const moved = applyEventChanges(
    events,
    [
      {
        day: '2026-08-12',
        id: 'series:2026-08-11',
        sourceId: 'series',
        start: '09:30',
        type: 'move',
      },
    ],
    days,
  );

  expect(moved.filter(event => event.sourceId === 'series').map(event => event.start)).toEqual([
    '09:30',
    '09:30',
    '09:30',
  ]);
});

test('moving a weekly occurrence changes every visible occurrence to the target weekday', () => {
  const days = Array.from({ length: 14 }, (_, index) => {
    const day = new Date('2026-08-10T00:00:00.000Z');
    day.setUTCDate(day.getUTCDate() + index);
    return day.toISOString().slice(0, 10);
  });
  const events = [recurringEvent('2026-08-10', 'monday'), recurringEvent('2026-08-17', 'monday')];

  const moved = applyEventChanges(
    events,
    [
      {
        day: '2026-08-12',
        id: 'series:2026-08-10',
        sourceId: 'series',
        start: '09:30',
        type: 'move',
      },
    ],
    days,
  );

  expect(
    moved
      .filter(event => event.sourceId === 'series')
      .map(event => ({ day: event.day, recurrence: event.recurrence, start: event.start })),
  ).toEqual([
    { day: '2026-08-12', recurrence: 'wednesday', start: '09:30' },
    { day: '2026-08-19', recurrence: 'wednesday', start: '09:30' },
  ]);
});
