import type { CalendarColor } from '../types/calendar';

export const CALENDAR_COLORS: CalendarColor[] = [
  'rose',
  'orange',
  'amber',
  'green',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'magenta',
  'pink',
];

export function isCalendarColor(value: string): value is CalendarColor {
  return (CALENDAR_COLORS as string[]).includes(value);
}

type Variants = { darkBg: string; darkText: string; lightBg: string; lightText: string };

const VARIANTS: Record<CalendarColor, Variants> = {
  amber: { darkBg: '#c99a45', darkText: '#111114', lightBg: '#a86f12', lightText: '#ffffff' },
  blue: { darkBg: '#6f8fe5', darkText: '#111114', lightBg: '#4f6ee6', lightText: '#ffffff' },
  cyan: { darkBg: '#52a8ba', darkText: '#111114', lightBg: '#267f95', lightText: '#ffffff' },
  fuchsia: { darkBg: '#c06bb9', darkText: '#111114', lightBg: '#aa3d9d', lightText: '#ffffff' },
  green: { darkBg: '#5aaa74', darkText: '#111114', lightBg: '#2d8750', lightText: '#ffffff' },
  indigo: { darkBg: '#8580db', darkText: '#111114', lightBg: '#595bc9', lightText: '#ffffff' },
  magenta: { darkBg: '#c16ba7', darkText: '#111114', lightBg: '#aa3f88', lightText: '#ffffff' },
  orange: { darkBg: '#d27f51', darkText: '#111114', lightBg: '#bd5b2b', lightText: '#ffffff' },
  pink: { darkBg: '#cd7295', darkText: '#111114', lightBg: '#ba4374', lightText: '#ffffff' },
  rose: { darkBg: '#d87391', darkText: '#111114', lightBg: '#c04468', lightText: '#ffffff' },
  sky: { darkBg: '#61a1cf', darkText: '#111114', lightBg: '#2f78aa', lightText: '#ffffff' },
  teal: { darkBg: '#50aaa0', darkText: '#111114', lightBg: '#238078', lightText: '#ffffff' },
  violet: { darkBg: '#9c78d0', darkText: '#111114', lightBg: '#7651b9', lightText: '#ffffff' },
};

export const CALENDAR_HEX = Object.fromEntries(
  Object.entries(VARIANTS).map(([color, variant]) => [color, variant.lightBg]),
) as Record<CalendarColor, string>;

export function chipStyle(color: CalendarColor): React.CSSProperties {
  const variant = VARIANTS[color];
  return {
    '--cal-db': variant.darkBg,
    '--cal-dt': variant.darkText,
    '--cal-lb': variant.lightBg,
    '--cal-lt': variant.lightText,
  } as React.CSSProperties;
}

export function colorStyle(color: CalendarColor): React.CSSProperties {
  return { backgroundColor: CALENDAR_HEX[color] };
}
