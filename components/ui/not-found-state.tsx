import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FlowMark } from '@/components/ui/flow-mark';

export function NotFoundState({ body }: { body: string }) {
  return (
    <div className="flex max-w-sm flex-col items-center gap-3">
      <FlowMark animated className="mb-1 size-10" />
      <p className="text-muted text-sm tabular-nums">404</p>
      <h1 className="text-xl font-semibold tracking-tight">That page isn&apos;t on the calendar.</h1>
      <p className="text-muted text-sm leading-6">{body}</p>
      <Link className="mt-1" href="/">
        <Button variant="secondary">Back to Flow</Button>
      </Link>
    </div>
  );
}
