import 'server-only';

export const DEMO_DELAYS = {
  bookingAvailability: 900,
  bookingProfile: 650,
  bookingSettings: 1100,
  calendarEvents: 1100,
  calendarList: 400,
} as const;

export function isSlowEnabled() {
  return process.env.NODE_ENV === 'development';
}
