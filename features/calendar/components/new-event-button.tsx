'use client';

import * as Ariakit from '@ariakit/react';
import { Plus } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button';
import { EventCreateDialog } from './event-create-dialog';

export function NewEventButton({ day }: { day: string }) {
  const store = Ariakit.usePopoverStore({ placement: 'bottom-start' });

  return (
    <>
      <Ariakit.PopoverDisclosure className={buttonClasses()} store={store}>
        <Plus className="size-4" />
        <span className="hidden sm:inline">New event</span>
      </Ariakit.PopoverDisclosure>
      <EventCreateDialog day={day} store={store} />
    </>
  );
}
