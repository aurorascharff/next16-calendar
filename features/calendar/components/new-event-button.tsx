'use client';

import * as Ariakit from '@ariakit/react';
import { Plus } from 'lucide-react';
import { EventCreateDialog } from './event-create-dialog';

export function NewEventButton({ day }: { day: string }) {
  const store = Ariakit.usePopoverStore({ placement: 'bottom-start' });

  return (
    <>
      <Ariakit.PopoverDisclosure
        store={store}
        className="bg-accent hover:bg-accent-hover focus-visible:ring-accent/40 inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">New event</span>
      </Ariakit.PopoverDisclosure>
      <EventCreateDialog day={day} store={store} />
    </>
  );
}
