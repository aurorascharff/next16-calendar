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
  amber: { darkBg: '#c19a58', darkText: '#111114', lightBg: '#96651f', lightText: '#ffffff' },
  blue: { darkBg: '#7892d8', darkText: '#111114', lightBg: '#4f6ed7', lightText: '#ffffff' },
  cyan: { darkBg: '#64a2af', darkText: '#111114', lightBg: '#317587', lightText: '#ffffff' },
  fuchsia: { darkBg: '#b978b5', darkText: '#111114', lightBg: '#9b468f', lightText: '#ffffff' },
  green: { darkBg: '#6aa27b', darkText: '#111114', lightBg: '#397a4f', lightText: '#ffffff' },
  indigo: { darkBg: '#8985cb', darkText: '#111114', lightBg: '#5c58b8', lightText: '#ffffff' },
  magenta: { darkBg: '#b976a8', darkText: '#111114', lightBg: '#98467f', lightText: '#ffffff' },
  orange: { darkBg: '#ca885f', darkText: '#111114', lightBg: '#a95d32', lightText: '#ffffff' },
  pink: { darkBg: '#c17d98', darkText: '#111114', lightBg: '#a54c70', lightText: '#ffffff' },
  rose: { darkBg: '#ca7c91', darkText: '#111114', lightBg: '#ad4b64', lightText: '#ffffff' },
  sky: { darkBg: '#70a0c1', darkText: '#111114', lightBg: '#3b719b', lightText: '#ffffff' },
  teal: { darkBg: '#61a098', darkText: '#111114', lightBg: '#34756e', lightText: '#ffffff' },
  violet: { darkBg: '#9981c4', darkText: '#111114', lightBg: '#7354aa', lightText: '#ffffff' },
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
