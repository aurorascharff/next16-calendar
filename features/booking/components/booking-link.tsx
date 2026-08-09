'use client';

import { Check, Copy, ExternalLink, Link2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
      <p className="text-muted mb-2 text-xs font-medium">Share link</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="border-divider bg-card/60 dark:border-divider-dark dark:bg-card-dark/50 flex min-w-0 flex-1 items-center gap-2 rounded-md border px-3 py-2">
          <Link2 className="text-muted size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate font-mono text-sm text-black dark:text-white">{path}</span>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1 sm:flex-none" onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Copied' : 'Copy link'}
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            render={<Link href={path as Route} rel="noopener noreferrer" target="_blank" />}
            variant="secondary"
          >
            <ExternalLink className="size-4" />
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
