import 'server-only'

import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { SESSION_COOKIE } from './session'

export type CurrentUser = { handle: string; id: string; name: string }

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies()
  const id = store.get(SESSION_COOKIE)?.value
  if (!id) return null
  return prisma.user.findUnique({ select: { handle: true, id: true, name: true }, where: { id } })
}
