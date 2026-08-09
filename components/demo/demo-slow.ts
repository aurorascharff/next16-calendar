import 'server-only';

import { cookies } from 'next/headers';

export const SLOW_COOKIE = 'slow';

// Whether the demo's artificial DB latency is on. Off by default; the sidebar
// toggle opts in. Read in the uncached query wrappers and passed into the cached
// functions (which can't read cookies themselves).
export async function isSlowEnabled() {
  return (await cookies()).has(SLOW_COOKIE);
}
