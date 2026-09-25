'use client';

import { catchError, type ErrorInfo } from 'next/error';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { FlowMark } from '@/components/ui/flow-mark';
import { Spinner } from '@/components/ui/spinner';

function RetryButton({ retry }: { retry: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      aria-busy={isPending}
      disabled={isPending}
      onClick={() => startTransition(() => retry())}
      size="sm"
      variant="secondary"
    >
      {isPending && <Spinner />}
      {isPending ? 'Retrying…' : 'Try again'}
    </Button>
  );
}

function ErrorFallback(props: { title?: string; compact?: boolean }, { retry }: ErrorInfo) {
  if (props.compact) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-4 text-center">
        <FlowMark animated className="text-danger size-5" tone="current" />
        <p className="text-muted text-xs">{props.title ?? 'Something went wrong'}</p>
        <RetryButton retry={retry} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
      <FlowMark animated className="text-danger size-8" tone="current" />
      <p className="text-sm font-medium text-black dark:text-white">{props.title ?? 'Something went wrong'}</p>
      <RetryButton retry={retry} />
    </div>
  );
}

export default catchError(ErrorFallback);
