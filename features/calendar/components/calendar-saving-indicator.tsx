'use client';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useCalendarEvents } from '@/providers/calendar-events-provider';

export function CalendarSavingIndicator() {
  const { isPending } = useCalendarEvents();

  return (
    <span className="text-accent grid size-5 shrink-0 place-items-center" role="status">
      <Spinner
        className={cn(
          'size-4 transition-[opacity,transform,visibility] duration-150 motion-reduce:animate-none',
          isPending ? 'visible scale-100 opacity-100' : 'invisible scale-90 opacity-0',
        )}
      />
      <span className="sr-only">{isPending ? 'Saving calendar changes' : null}</span>
    </span>
  );
}
