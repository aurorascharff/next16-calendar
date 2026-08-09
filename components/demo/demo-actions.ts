'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { SLOW_COOKIE } from './demo-slow';

export async function setSlow(enabled: boolean) {
  const store = await cookies();
  if (enabled) store.set(SLOW_COOKIE, '1', { maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax' });
  else store.delete(SLOW_COOKIE);
  revalidatePath('/', 'layout');
}
