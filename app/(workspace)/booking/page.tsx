'use client'

import { Check, Copy, ExternalLink, Link2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function SharePage() {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/book/aurora`)
    setCopied(true)
    toast.success('Link copied.')
    window.setTimeout(() => setCopied(false), 2_000)
  }

  return (
    <main className="min-w-0 flex-1 overflow-auto">
      <header className="flex min-h-18 items-center border-b border-divider px-4 sm:px-6 dark:border-divider-dark">
        <div>
          <p className="text-muted text-xs font-medium">Availability</p>
          <h1 className="mt-0.5 text-lg font-semibold">Booking link</h1>
        </div>
      </header>
      <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="border-divider rounded-xl border bg-card/40 p-6 dark:border-divider-dark dark:bg-card-dark/30">
          <div className="mb-4 grid size-10 place-items-center rounded-lg bg-accent/15 text-accent">
            <Link2 className="size-5" />
          </div>
          <h2 className="text-base font-semibold">Focused conversation</h2>
          <p className="text-muted mt-1 text-sm">30-minute slots, weekdays 09:30–15:00.</p>
          <div className="border-divider mt-5 flex flex-wrap items-center gap-2 border-t pt-4 dark:border-divider-dark">
            <code className="text-muted flex-1 truncate rounded bg-card px-3 py-2 font-mono text-xs dark:bg-card-dark">
              pace.dev/book/aurora
            </code>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              onClick={copyLink}
              type="button"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <Link
              className="border-divider text-muted inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-card hover:text-black dark:border-divider-dark dark:hover:bg-card-dark dark:hover:text-white"
              href="/book/aurora"
              prefetch
            >
              <ExternalLink className="size-4" />
              Preview
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
