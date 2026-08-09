'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { SLOW_COOKIE } from './demo-slow';

const NO_PREFETCH_COOKIE = 'no-prefetch';

export async function setSlow(enabled: boolean) {
  const store = await cookies();
  if (enabled) store.set(SLOW_COOKIE, '1', { maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax' });
  else store.delete(SLOW_COOKIE);
  revalidatePath('/', 'layout');
}

export async function setPrefetch(enabled: boolean) {
  const store = await cookies();
  if (enabled) store.delete(NO_PREFETCH_COOKIE);
  else store.set(NO_PREFETCH_COOKIE, '1', { path: '/', sameSite: 'lax' });
  revalidatePath('/', 'layout');
}

export async function isPrefetchEnabled() {
  const store = await cookies();
  return !store.has(NO_PREFETCH_COOKIE);
}
