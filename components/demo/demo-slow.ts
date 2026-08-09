import 'server-only';

import { cookies } from 'next/headers';

export const SLOW_COOKIE = 'slow';

export async function isSlowEnabled() {
  return (await cookies()).has(SLOW_COOKIE);
}
