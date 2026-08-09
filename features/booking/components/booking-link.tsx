'use client'

import { Check, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Route } from 'next'

export function BookingLink({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false)
  const [host, setHost] = useState('')
  const path = `/book/${handle}`

  useEffect(() => setHost(window.location.host), [])

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`)
    setCopied(true)
    toast.success('Link copied.')
    window.setTimeout(() => setCopied(false), 2_000)
  }

  return (
    <div className="border-divider mt-5 flex flex-wrap items-center gap-2 border-t pt-4 dark:border-divider-dark">
      <code className="text-muted flex-1 truncate rounded bg-card px-3 py-2 font-mono text-xs dark:bg-card-dark">
        {host ? `${host}${path}` : path}
      </code>
      <button
        className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        onClick={copy}
        type="button"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <Link
        className="border-divider text-muted inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-card hover:text-black dark:border-divider-dark dark:hover:bg-card-dark dark:hover:text-white"
        href={path as Route}
        prefetch
      >
        <ExternalLink className="size-4" />
        Preview
      </Link>
    </div>
  )
}
