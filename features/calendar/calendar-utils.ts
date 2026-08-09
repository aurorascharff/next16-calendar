import type { CalendarView } from './types/calendar';
import type { Route } from 'next';

const dayFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
  timeZone: 'UTC',
});

const monthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const dayLongFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
  timeZone: 'UTC',
});

function dateFromKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function isDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = dateFromKey(value);
  return !Number.isNaN(date.valueOf()) && dateKey(date) === value;
}

export function formatDay(value: string) {
  return dayFormatter.format(dateFromKey(value));
}

export function formatMonth(value: string) {
  return monthFormatter.format(dateFromKey(value));
}

export function calendarHref(date: string, view: CalendarView) {
  return `/calendar/${date}${view === 'month' ? '?view=month' : ''}` as Route;
}

export function getWeekDays(value: string) {
  const date = dateFromKey(value);
  const offset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offset);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date);
    day.setUTCDate(day.getUTCDate() + index);
    return dateKey(day);
  });
}

export function getMonthDays(value: string) {
  const date = dateFromKey(value);
  date.setUTCDate(1);
  const offset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(date);
    day.setUTCDate(day.getUTCDate() + index);
    return dateKey(day);
  });
}

export function shiftWeek(value: string, direction: -1 | 1) {
  const date = dateFromKey(value);
  date.setUTCDate(date.getUTCDate() + direction * 7);
  return dateKey(date);
}

export function shiftDay(value: string, direction: -1 | 1) {
  const date = dateFromKey(value);
  date.setUTCDate(date.getUTCDate() + direction);
  return dateKey(date);
}

export function shiftMonth(value: string, direction: -1 | 1) {
  const date = dateFromKey(value);
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + direction);
  return dateKey(date);
}

export function formatDayLong(value: string) {
  return dayLongFormatter.format(dateFromKey(value));
}

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}
