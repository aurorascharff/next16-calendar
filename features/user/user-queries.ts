import 'server-only';

import { cacheLife } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { SESSION_COOKIE } from './session';
import type { Route } from 'next';

export type CurrentUser = { handle: string; id: string; name: string };

export async function getCurrentUser(): Promise<CurrentUser | null> {
  'use cache: private';
  cacheLife('hours');

  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return prisma.user.findUnique({ select: { handle: true, id: true, name: true }, where: { id } });
}

export async function verifyAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/logout' as Route);
  return user;
}
