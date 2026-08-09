'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { deleteSessionCookies, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE, STALE_SESSION_COOKIES } from './session';

type SignInState = { error?: string } | null;

function toHandle(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Enter a name to sign in.' };

  const handle = toHandle(name) || `guest-${name.length}`;

  let userId: string;
  try {
    const user = await prisma.user.upsert({ create: { handle, name }, update: {}, where: { handle } });
    userId = user.id;
  } catch {
    return { error: 'Could not sign you in. Please try again.' };
  }

  const store = await cookies();
  for (const name of STALE_SESSION_COOKIES) store.delete(name);
  store.set(SESSION_COOKIE, userId, { maxAge: SESSION_COOKIE_MAX_AGE, path: '/', sameSite: 'lax' });
  redirect('/');
}

export async function signOut() {
  const store = await cookies();
  deleteSessionCookies(store);
  redirect('/login');
}
