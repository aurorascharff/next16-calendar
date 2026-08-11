'use client';

import * as Ariakit from '@ariakit/react';
import { Plus } from 'lucide-react';
import { Boundary } from '@/components/internal/boundary';
import { buttonClasses } from '@/components/ui/button';
import { EventCreateDialog } from './event-create-dialog';

export function NewEventButton({ day }: { day: string }) {
  const store = Ariakit.usePopoverStore({ placement: 'top-end' });

  return (
    <>
      <Boundary label="NewEventButton" asChild>
        <Ariakit.PopoverDisclosure
          aria-label="New event"
          className={buttonClasses({
            className:
              'fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 size-12 p-0 shadow-lg transition-[background-color,box-shadow] hover:shadow-xl sm:right-6 sm:bottom-6 sm:h-10 sm:w-auto sm:px-4',
          })}
          store={store}
          style={{ viewTransitionName: 'new-event-button' }}
        >
          <Plus className="size-5 sm:size-4" />
          <span className="hidden sm:inline">New event</span>
        </Ariakit.PopoverDisclosure>
      </Boundary>
      <EventCreateDialog day={day} key={day} store={store} />
    </>
  );
}
