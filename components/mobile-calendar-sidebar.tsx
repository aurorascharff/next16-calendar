'use client';

import * as Ariakit from '@ariakit/react';
import { X } from 'lucide-react';
import { FlowMark } from '@/components/ui/flow-mark';
import type { ReactNode } from 'react';

export function MobileCalendarSidebar({ children }: { children: ReactNode }) {
  const store = Ariakit.useDialogStore();

  return (
    <>
      <Ariakit.DialogDisclosure
        aria-label="Open navigation"
        className="border-divider bg-surface/90 focus-visible:ring-accent dark:border-divider-dark dark:bg-surface-dark/90 fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-30 grid size-11 place-items-center rounded-full border shadow-lg backdrop-blur-md focus-visible:ring-2 focus-visible:outline-none md:hidden"
        store={store}
      >
        <FlowMark className="size-6" />
      </Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        backdrop={<div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] md:hidden" />}
        className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-3rem))] flex-col border-r p-4 shadow-2xl outline-none md:hidden"
        hideOnInteractOutside
        onClick={event => {
          if ((event.target as HTMLElement).closest('a[href]')) store.hide();
        }}
        store={store}
        unmountOnHide
      >
        <Ariakit.DialogHeading className="sr-only">Flow navigation</Ariakit.DialogHeading>
        <Ariakit.DialogDismiss
          aria-label="Close navigation"
          className="text-muted hover:bg-card focus-visible:ring-accent dark:hover:bg-card-dark absolute top-3 right-3 grid size-9 place-items-center rounded-md hover:text-black focus-visible:ring-2 focus-visible:outline-none dark:hover:text-white"
        >
          <X className="size-5" />
        </Ariakit.DialogDismiss>
        {children}
      </Ariakit.Dialog>
    </>
  );
}
