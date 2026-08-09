import type { CalendarColor } from '../types/calendar';

export const CALENDAR_COLORS: CalendarColor[] = ['indigo', 'violet', 'sky', 'teal', 'rose', 'blue'];

export function isCalendarColor(value: string): value is CalendarColor {
  return (CALENDAR_COLORS as string[]).includes(value);
}

// Cool jewel-tone bases. Chips are a solid saturated fill with white text; dark
// mode deepens the fill slightly so it reads richly against the near-black grid.
const BASE_HEX: Record<CalendarColor, string> = {
  blue: '#2563eb',
  indigo: '#4f46e5',
  rose: '#e11d48',
  sky: '#0284c7',
  teal: '#0d9488',
  violet: '#7c3aed',
};

type RGB = [number, number, number];
const INK: RGB = [17, 17, 20];

function toRgb(hex: string): RGB {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function mix(from: RGB, to: RGB, amount: number): string {
  return `#${[0, 1, 2]
    .map(i =>
      Math.round(from[i] + (to[i] - from[i]) * amount)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

type Variants = { darkBg: string; darkText: string; lightBg: string; lightText: string };

const VARIANTS = Object.fromEntries(
  CALENDAR_COLORS.map(color => {
    const base = toRgb(BASE_HEX[color]);
    return [
      color,
      { darkBg: mix(base, INK, 0.22), darkText: '#ffffff', lightBg: BASE_HEX[color], lightText: '#ffffff' },
    ];
  }),
) as Record<CalendarColor, Variants>;

export function chipStyle(color: CalendarColor): React.CSSProperties {
  const variant = VARIANTS[color];
  return {
    '--cal-db': variant.darkBg,
    '--cal-dt': variant.darkText,
    '--cal-lb': variant.lightBg,
    '--cal-lt': variant.lightText,
  } as React.CSSProperties;
}

export const dotClass: Record<CalendarColor, string> = {
  blue: 'bg-[#2563eb]',
  indigo: 'bg-[#4f46e5]',
  rose: 'bg-[#e11d48]',
  sky: 'bg-[#0284c7]',
  teal: 'bg-[#0d9488]',
  violet: 'bg-[#7c3aed]',
};
