import 'server-only';

import { cookies } from 'next/headers';

export const SLOW_COOKIE = 'slow';

// Artificial latency is opt-in. Read the cookie outside cached queries, then
// pass the result into them so cached functions never access request data.
export async function isSlowEnabled() {
  return (await cookies()).has(SLOW_COOKIE);
}
