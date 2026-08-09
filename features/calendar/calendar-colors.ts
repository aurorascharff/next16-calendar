import type { CalendarColor } from './types/calendar'

export const CALENDAR_COLORS: CalendarColor[] = ['indigo', 'blue', 'sky', 'teal', 'violet', 'rose']

export function isCalendarColor(value: string): value is CalendarColor {
  return (CALENDAR_COLORS as string[]).includes(value)
}

// Solid event chip: vibrant in light, a shade deeper in dark, white text.
export const chipClass: Record<CalendarColor, string> = {
  blue: 'bg-blue-500 text-white ring-black/5 shadow-sm dark:bg-blue-600',
  indigo: 'bg-indigo-500 text-white ring-black/5 shadow-sm dark:bg-indigo-600',
  rose: 'bg-rose-500 text-white ring-black/5 shadow-sm dark:bg-rose-600',
  sky: 'bg-sky-500 text-white ring-black/5 shadow-sm dark:bg-sky-600',
  teal: 'bg-teal-500 text-white ring-black/5 shadow-sm dark:bg-teal-600',
  violet: 'bg-violet-500 text-white ring-black/5 shadow-sm dark:bg-violet-600',
}

export const dotClass: Record<CalendarColor, string> = {
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
  teal: 'bg-teal-500',
  violet: 'bg-violet-500',
}
