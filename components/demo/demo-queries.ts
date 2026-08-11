import 'server-only';

import { cookies } from 'next/headers';

export const NO_PREFETCH_COOKIE = 'no-prefetch';

export async function isPrefetchEnabled() {
  return !(await cookies()).has(NO_PREFETCH_COOKIE);
}
