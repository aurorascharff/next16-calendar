'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`)
    setCopied(true)
    toast.success('Link copied.')
    window.setTimeout(() => setCopied(false), 2_000)
  }

  return (
    <button
      className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      onClick={copy}
      type="button"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? 'Copied' : 'Copy link'}
    </button>
  )
}
