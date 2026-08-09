'use client';

import { Button } from '@/components/ui/button';
import { DaylineMark } from '@/components/ui/dayline-mark';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-w-0 flex-1 place-items-center px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <DaylineMark animated className="text-danger mb-1 size-10" />
        <p className="text-sm font-medium text-black dark:text-white">Something went wrong</p>
        <p className="text-muted max-w-xs text-sm leading-6">We couldn&apos;t load your schedule. Please try again.</p>
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
