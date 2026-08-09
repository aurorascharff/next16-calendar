import { CalendarX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WorkspaceNotFound() {
  return (
    <main className="grid min-h-0 min-w-0 flex-1 place-items-center px-6 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <CalendarX className="text-muted size-8" strokeWidth={1.5} />
        <p className="text-muted text-sm">404</p>
        <h1 className="text-xl font-semibold tracking-tight">That page isn&apos;t on the calendar.</h1>
        <p className="text-muted text-sm leading-6">Pick a date or return to your calendar workspace.</p>
        <Link className="mt-1" href="/">
          <Button>Back to Pace</Button>
        </Link>
      </div>
    </main>
  );
}
