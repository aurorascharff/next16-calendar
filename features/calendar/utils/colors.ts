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

export const CALENDAR_HEX: Record<CalendarColor, string> = {
  amber: '#b45309',
  blue: '#2563eb',
  cyan: '#0e7490',
  fuchsia: '#c026d3',
  green: '#15803d',
  indigo: '#4f46e5',
  magenta: '#c21d92',
  orange: '#c2410c',
  pink: '#db2777',
  rose: '#e11d48',
  sky: '#0369a1',
  teal: '#0f766e',
  violet: '#7c3aed',
};

export function isCalendarColor(value: string): value is CalendarColor {
  return (CALENDAR_COLORS as string[]).includes(value);
}

type RGB = [number, number, number];
const INK: RGB = [17, 17, 20];
const MUTE: RGB = [115, 115, 125];

const MUTE_AMOUNT = 0.34;

function toRgb(hex: string): RGB {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function mixRgb(from: RGB, to: RGB, amount: number): RGB {
  return [0, 1, 2].map(i => Math.round(from[i] + (to[i] - from[i]) * amount)) as RGB;
}

function toHex([r, g, b]: RGB): string {
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

type Variants = { darkBg: string; darkText: string; lightBg: string; lightText: string };

// Muted solid: pull the hue toward neutral gray so chips read as calm, dusty tones
// (not neon), then deepen for dark. White text throughout.
const VARIANTS = Object.fromEntries(
  CALENDAR_COLORS.map(color => {
    const muted = mixRgb(toRgb(CALENDAR_HEX[color]), MUTE, MUTE_AMOUNT);
    return [
      color,
      { darkBg: toHex(mixRgb(muted, INK, 0.3)), darkText: '#ffffff', lightBg: toHex(muted), lightText: '#ffffff' },
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

export function colorStyle(color: CalendarColor): React.CSSProperties {
  return { backgroundColor: CALENDAR_HEX[color] };
}
