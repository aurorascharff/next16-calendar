import type { CalendarColor } from '../types/calendar'

export const CALENDAR_COLORS: CalendarColor[] = ['indigo', 'violet', 'sky', 'teal', 'rose', 'blue']

export function isCalendarColor(value: string): value is CalendarColor {
  return (CALENDAR_COLORS as string[]).includes(value)
}

// One base hue per calendar. Light and dark chip variants are derived from it so
// light mode gets a soft tint with deep colored text, and dark mode gets a deep
// fill with light colored text — never the same vibrant color in both themes.
const BASE_HEX: Record<CalendarColor, string> = {
  blue: '#3b82f6',
  indigo: '#6366f1',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  teal: '#14b8a6',
  violet: '#8b5cf6',
}

type RGB = [number, number, number]
const WHITE: RGB = [255, 255, 255]
const INK: RGB = [21, 21, 26]

function toRgb(hex: string): RGB {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

function toHex([r, g, b]: RGB): string {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`
}

function mix(from: RGB, to: RGB, amount: number): string {
  return toHex([from[0] + (to[0] - from[0]) * amount, from[1] + (to[1] - from[1]) * amount, from[2] + (to[2] - from[2]) * amount])
}

type Variants = { darkBg: string; darkText: string; lightBg: string; lightText: string }

const VARIANTS = Object.fromEntries(
  CALENDAR_COLORS.map((color) => {
    const base = toRgb(BASE_HEX[color])
    return [color, { darkBg: mix(base, INK, 0.64), darkText: mix(base, WHITE, 0.58), lightBg: mix(base, WHITE, 0.84), lightText: mix(base, INK, 0.32) }]
  }),
) as Record<CalendarColor, Variants>

export function chipStyle(color: CalendarColor): React.CSSProperties {
  const variant = VARIANTS[color]
  return {
    '--cal-db': variant.darkBg,
    '--cal-dt': variant.darkText,
    '--cal-lb': variant.lightBg,
    '--cal-lt': variant.lightText,
  } as React.CSSProperties
}

export const dotClass: Record<CalendarColor, string> = {
  blue: 'bg-[#3b82f6]',
  indigo: 'bg-[#6366f1]',
  rose: 'bg-[#f43f5e]',
  sky: 'bg-[#0ea5e9]',
  teal: 'bg-[#14b8a6]',
  violet: 'bg-[#8b5cf6]',
}
