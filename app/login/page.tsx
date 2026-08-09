'use client'

import { CalendarDays } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Spinner } from '@/components/ui/spinner'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('Aurora')
  const [isPending, startTransition] = useTransition()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    startTransition(() => router.push('/'))
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-6 dark:bg-surface-dark">
      <form className="w-full max-w-sm" onSubmit={submit}>
        <span className="mx-auto mb-6 grid size-12 place-items-center rounded-xl bg-accent text-white">
          <CalendarDays className="size-6" strokeWidth={2.25} />
        </span>
        <h1 className="text-center text-2xl font-semibold tracking-tight">Sign in to Cadence</h1>
        <label className="mt-8 block">
          <span className="text-muted mb-1.5 block text-xs font-medium">Name</span>
          <input autoFocus disabled={isPending} onChange={(event) => setName(event.target.value)} placeholder="Your name" value={name} />
        </label>
        <button
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          disabled={isPending || !name.trim()}
          type="submit"
        >
          {isPending ? <Spinner /> : null}
          {isPending ? 'Signing in…' : 'Continue'}
        </button>
      </form>
    </main>
  )
}
