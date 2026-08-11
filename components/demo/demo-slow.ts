import 'server-only';

import { cookies } from 'next/headers';

export const SLOW_COOKIE = 'slow';

export const DEMO_DELAYS = {
  bookingAvailability: 900,
  bookingProfile: 650,
  bookingSettings: 1100,
  calendarEvents: 1100,
  calendarList: 400,
} as const;

// Artificial latency is opt-in. Read the cookie outside cached queries, then
// pass the result into them so cached functions never access request data.
export async function isSlowEnabled() {
  return (await cookies()).has(SLOW_COOKIE);
}
