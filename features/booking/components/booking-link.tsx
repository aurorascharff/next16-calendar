'use client';

import { Check, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Route } from 'next';

export function BookingLink({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/book/${handle}`;

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    setCopied(true);
    toast.success('Link copied.');
    window.setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <div className="border-divider dark:border-divider-dark mt-5 border-t pt-4">
      <p className="text-muted text-xs font-medium">Share link</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-black dark:text-white">{path}</p>
        <button
          className="bg-accent hover:bg-accent-hover inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white transition-colors"
          onClick={copy}
          type="button"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <Link
          className="border-divider text-muted hover:bg-card dark:border-divider-dark dark:hover:bg-card-dark inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:text-black dark:hover:text-white"
          href={path as Route}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink className="size-4" />
          Preview
        </Link>
      </div>
    </div>
  );
}
