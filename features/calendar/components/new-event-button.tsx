'use client';

import * as Ariakit from '@ariakit/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCreateDialog } from './event-create-dialog';

export function NewEventButton({ day }: { day: string }) {
  const store = Ariakit.usePopoverStore({ placement: 'bottom-start' });

  return (
    <>
      <Button
        className="size-11 rounded-full p-0 sm:h-auto sm:w-auto sm:rounded-md sm:px-4 sm:py-2"
        render={<Ariakit.PopoverDisclosure aria-label="New event" store={store} />}
      >
        <Plus className="size-5 sm:size-4" />
        <span className="hidden sm:inline">New event</span>
      </Button>
      <EventCreateDialog day={day} store={store} />
    </>
  );
}
