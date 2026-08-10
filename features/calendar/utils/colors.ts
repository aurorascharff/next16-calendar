import type { CalendarColor } from '../types/calendar';

export const CALENDAR_COLORS: CalendarColor[] = ['rose', 'pink', 'violet', 'indigo', 'blue', 'sky', 'cyan', 'teal'];

type Variants = {
  darkBg: string;
  darkBgEnd: string;
  darkText: string;
  lightBg: string;
  lightBgEnd: string;
  lightText: string;
};

const VARIANTS: Record<CalendarColor, Variants> = {
  amber: {
    darkBg: '#d97706',
    darkBgEnd: '#b45309',
    darkText: '#ffffff',
    lightBg: '#f59e0b',
    lightBgEnd: '#d97706',
    lightText: '#18181b',
  },
  blue: {
    darkBg: '#2563eb',
    darkBgEnd: '#4338ca',
    darkText: '#ffffff',
    lightBg: '#3b82f6',
    lightBgEnd: '#4f46e5',
    lightText: '#ffffff',
  },
  cyan: {
    darkBg: '#0891b2',
    darkBgEnd: '#1d4ed8',
    darkText: '#ffffff',
    lightBg: '#22d3ee',
    lightBgEnd: '#2563eb',
    lightText: '#ffffff',
  },
  fuchsia: {
    darkBg: '#c026d3',
    darkBgEnd: '#7e22ce',
    darkText: '#ffffff',
    lightBg: '#d946ef',
    lightBgEnd: '#9333ea',
    lightText: '#ffffff',
  },
  green: {
    darkBg: '#059669',
    darkBgEnd: '#047857',
    darkText: '#ffffff',
    lightBg: '#10b981',
    lightBgEnd: '#059669',
    lightText: '#ffffff',
  },
  indigo: {
    darkBg: '#6366f1',
    darkBgEnd: '#2563eb',
    darkText: '#ffffff',
    lightBg: '#818cf8',
    lightBgEnd: '#3b82f6',
    lightText: '#ffffff',
  },
  magenta: {
    darkBg: '#c026d3',
    darkBgEnd: '#7e22ce',
    darkText: '#ffffff',
    lightBg: '#d946ef',
    lightBgEnd: '#9333ea',
    lightText: '#ffffff',
  },
  orange: {
    darkBg: '#ea580c',
    darkBgEnd: '#c2410c',
    darkText: '#ffffff',
    lightBg: '#fb923c',
    lightBgEnd: '#f97316',
    lightText: '#ffffff',
  },
  pink: {
    darkBg: '#db2777',
    darkBgEnd: '#be123c',
    darkText: '#ffffff',
    lightBg: '#ec4899',
    lightBgEnd: '#e11d48',
    lightText: '#ffffff',
  },
  rose: {
    darkBg: '#dc2626',
    darkBgEnd: '#b91c1c',
    darkText: '#ffffff',
    lightBg: '#ef4444',
    lightBgEnd: '#dc2626',
    lightText: '#ffffff',
  },
  sky: {
    darkBg: '#0284c7',
    darkBgEnd: '#1d4ed8',
    darkText: '#ffffff',
    lightBg: '#38bdf8',
    lightBgEnd: '#1d4ed8',
    lightText: '#ffffff',
  },
  teal: {
    darkBg: '#0d9488',
    darkBgEnd: '#1d4ed8',
    darkText: '#ffffff',
    lightBg: '#2dd4bf',
    lightBgEnd: '#2563eb',
    lightText: '#ffffff',
  },
  violet: {
    darkBg: '#7c3aed',
    darkBgEnd: '#7e22ce',
    darkText: '#ffffff',
    lightBg: '#8b5cf6',
    lightBgEnd: '#9333ea',
    lightText: '#ffffff',
  },
};

export function isCalendarColor(value: string): value is CalendarColor {
  return Object.prototype.hasOwnProperty.call(VARIANTS, value);
}

export function chipStyle(color: CalendarColor): React.CSSProperties {
  const variant = VARIANTS[color];
  return {
    '--cal-db': variant.darkBg,
    '--cal-db-end': variant.darkBgEnd,
    '--cal-dt': variant.darkText,
    '--cal-lb': variant.lightBg,
    '--cal-lb-end': variant.lightBgEnd,
    '--cal-lt': variant.lightText,
  } as React.CSSProperties;
}

export function colorStyle(color: CalendarColor): React.CSSProperties {
  const variant = VARIANTS[color];
  return {
    '--cal-color-dark': variant.darkBg,
    '--cal-color-dark-end': variant.darkBgEnd,
    '--cal-color-light': variant.lightBg,
    '--cal-color-light-end': variant.lightBgEnd,
  } as React.CSSProperties;
}
