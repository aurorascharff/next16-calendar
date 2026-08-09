'use client';

import { Check, Copy, ExternalLink, Link2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { IconButton } from '@/components/ui/icon-button';

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
    <div className="border-divider dark:border-divider-dark mt-5 min-h-[7rem] border-t pt-4 sm:min-h-[5.5rem]">
      <p className="text-muted mb-2 text-xs font-medium">Share link</p>
      <div className="border-divider bg-card/60 dark:border-divider-dark dark:bg-card-dark/50 flex min-w-0 items-center gap-2 rounded-md border p-1 pl-3">
        <Link2 className="text-muted size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-black dark:text-white">{path}</span>
        <div className="flex shrink-0 gap-0.5">
          <IconButton label={copied ? 'Copied' : 'Copy link'} onClick={copy} size="sm">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </IconButton>
          <IconButton external href={path} label="Preview booking link" size="sm">
            <ExternalLink className="size-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
