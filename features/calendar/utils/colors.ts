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
  amber: { darkBg: '#e2b84f', darkText: '#111114', lightBg: '#bc8617', lightText: '#ffffff' },
  blue: { darkBg: '#83a0e8', darkText: '#111114', lightBg: '#5876d9', lightText: '#ffffff' },
  cyan: { darkBg: '#65bad0', darkText: '#111114', lightBg: '#278ba7', lightText: '#ffffff' },
  fuchsia: { darkBg: '#d681ca', darkText: '#111114', lightBg: '#b24ca5', lightText: '#ffffff' },
  green: { darkBg: '#67bd96', darkText: '#111114', lightBg: '#318d67', lightText: '#ffffff' },
  indigo: { darkBg: '#8f91e8', darkText: '#111114', lightBg: '#6264cf', lightText: '#ffffff' },
  magenta: { darkBg: '#d47fbb', darkText: '#111114', lightBg: '#b44991', lightText: '#ffffff' },
  orange: { darkBg: '#e59368', darkText: '#111114', lightBg: '#c86539', lightText: '#ffffff' },
  pink: { darkBg: '#dc7dac', darkText: '#111114', lightBg: '#c74d86', lightText: '#ffffff' },
  rose: { darkBg: '#e47f9f', darkText: '#111114', lightBg: '#cc4f72', lightText: '#ffffff' },
  sky: { darkBg: '#76afe0', darkText: '#111114', lightBg: '#3e82bb', lightText: '#ffffff' },
  teal: { darkBg: '#60bcb3', darkText: '#111114', lightBg: '#298d84', lightText: '#ffffff' },
  violet: { darkBg: '#a88cde', darkText: '#111114', lightBg: '#7752c7', lightText: '#ffffff' },
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
