'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { deleteSessionCookies, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE } from './session';

type SignInState = { error?: string } | null;

const signInSchema = z.object({
  email: z.preprocess(
    value => (typeof value === 'string' ? value.trim() : value),
    z.email('Enter a valid email address').max(254, 'Email is too long'),
  ),
});

function toHandle(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = signInSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { email } = parsed.data;
  const handle = toHandle(email) || `guest-${email.length}`;

  let userId: string;
  try {
    const user = await prisma.user.upsert({ create: { handle, name: email }, update: {}, where: { handle } });
    userId = user.id;
  } catch {
    return { error: 'Could not sign you in. Please try again.' };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, userId, { maxAge: SESSION_COOKIE_MAX_AGE, path: '/', sameSite: 'lax' });
  redirect('/');
}

export async function signOut() {
  const store = await cookies();
  deleteSessionCookies(store);
  redirect('/login');
}
