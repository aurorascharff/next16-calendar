import type { CalendarColor } from '../types/calendar'

export const CALENDAR_COLORS: CalendarColor[] = ['indigo', 'blue', 'sky', 'teal', 'violet', 'rose']

export function isCalendarColor(value: string): value is CalendarColor {
  return (CALENDAR_COLORS as string[]).includes(value)
}

// A curated, opaque, medium-tone palette — softer than Tailwind's -500 primaries
// (so it doesn't fight the accent blue) but solid and rich, not pale/translucent.
export const COLOR_HEX: Record<CalendarColor, string> = {
  blue: '#4d86d6',
  indigo: '#6c72cf',
  rose: '#d76b86',
  sky: '#3fa2d0',
  teal: '#35a597',
  violet: '#8a6fd1',
}

const chipBase = 'text-white ring-black/10 shadow-sm'
export const chipClass: Record<CalendarColor, string> = {
  blue: `${chipBase} bg-[#4d86d6]`,
  indigo: `${chipBase} bg-[#6c72cf]`,
  rose: `${chipBase} bg-[#d76b86]`,
  sky: `${chipBase} bg-[#3fa2d0]`,
  teal: `${chipBase} bg-[#35a597]`,
  violet: `${chipBase} bg-[#8a6fd1]`,
}

export const dotClass: Record<CalendarColor, string> = {
  blue: 'bg-[#4d86d6]',
  indigo: 'bg-[#6c72cf]',
  rose: 'bg-[#d76b86]',
  sky: 'bg-[#3fa2d0]',
  teal: 'bg-[#35a597]',
  violet: 'bg-[#8a6fd1]',
}
