'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createDemoWorkspace } from '@/features/calendar/demo-workspace'
import { SESSION_COOKIE } from './session'

type SignInState = { error?: string } | null

function toHandle(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return { error: 'Enter a name to sign in.' }

  const handle = toHandle(name) || `guest-${name.length}`

  let userId: string
  try {
    const existing = await prisma.user.findUnique({ where: { handle } })
    if (existing) {
      userId = existing.id
    } else {
      const user = await prisma.user.create({ data: { handle, name } })
      await createDemoWorkspace(prisma, user.id, user.handle)
      userId = user.id
    }
  } catch {
    return { error: 'Could not sign you in. Please try again.' }
  }

  const store = await cookies()
  store.set(SESSION_COOKIE, userId, { maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax' })
  redirect('/')
}

export async function signOut() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
  redirect('/login')
}
