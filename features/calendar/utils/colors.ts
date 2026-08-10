import type { CalendarColor } from '../types/calendar';

export const CALENDAR_COLORS: CalendarColor[] = [
  'rose',
  'orange',
  'pink',
  'magenta',
  'violet',
  'indigo',
  'blue',
  'cyan',
];

type Variants = { darkBg: string; darkText: string; lightBg: string; lightText: string };

const VARIANTS: Record<CalendarColor, Variants> = {
  amber: { darkBg: '#80621f', darkText: '#ffffff', lightBg: '#bc8617', lightText: '#ffffff' },
  blue: { darkBg: '#4e62a5', darkText: '#ffffff', lightBg: '#6a7dc2', lightText: '#ffffff' },
  cyan: { darkBg: '#347083', darkText: '#ffffff', lightBg: '#278ba7', lightText: '#ffffff' },
  fuchsia: { darkBg: '#86477d', darkText: '#ffffff', lightBg: '#b24ca5', lightText: '#ffffff' },
  green: { darkBg: '#376f58', darkText: '#ffffff', lightBg: '#318d67', lightText: '#ffffff' },
  indigo: { darkBg: '#574e91', darkText: '#ffffff', lightBg: '#695bb2', lightText: '#ffffff' },
  magenta: { darkBg: '#8b426f', darkText: '#ffffff', lightBg: '#b44991', lightText: '#ffffff' },
  orange: { darkBg: '#925037', darkText: '#ffffff', lightBg: '#c86539', lightText: '#ffffff' },
  pink: { darkBg: '#934766', darkText: '#ffffff', lightBg: '#c74d86', lightText: '#ffffff' },
  rose: { darkBg: '#8f3f5c', darkText: '#ffffff', lightBg: '#cc4f72', lightText: '#ffffff' },
  sky: { darkBg: '#456b80', darkText: '#ffffff', lightBg: '#467f9f', lightText: '#ffffff' },
  teal: { darkBg: '#2f716b', darkText: '#ffffff', lightBg: '#298d84', lightText: '#ffffff' },
  violet: { darkBg: '#68499b', darkText: '#ffffff', lightBg: '#7752c7', lightText: '#ffffff' },
};

export function isCalendarColor(value: string): value is CalendarColor {
  return Object.prototype.hasOwnProperty.call(VARIANTS, value);
}

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
