'use client';

import { catchError, type ErrorInfo } from 'next/error';
import { Button } from '@/components/ui/button';
import { FlowMark } from '@/components/ui/flow-mark';

function ErrorFallback(props: { title?: string; compact?: boolean }, { retry }: ErrorInfo) {
  if (props.compact) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-4 text-center">
        <FlowMark animated className="text-danger size-5" />
        <p className="text-muted text-xs">{props.title ?? 'Something went wrong'}</p>
        <Button size="sm" variant="secondary" onClick={() => retry()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
      <FlowMark animated className="text-danger size-8" />
      <p className="text-sm font-medium text-black dark:text-white">{props.title ?? 'Something went wrong'}</p>
      <Button size="sm" variant="secondary" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}

export default catchError(ErrorFallback);
