'use client';

import * as Ariakit from '@ariakit/react';
import { Menu, X } from 'lucide-react';
import { createContext, useContext, type ReactNode } from 'react';
import { IconButton } from '@/components/ui/icon-button';

const MobileCalendarSidebarContext = createContext<Ariakit.DialogStore | null>(null);

export function MobileCalendarSidebar({ children, sidebar }: { children: ReactNode; sidebar: ReactNode }) {
  const store = Ariakit.useDialogStore();

  return (
    <MobileCalendarSidebarContext.Provider value={store}>
      {children}
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
        {sidebar}
      </Ariakit.Dialog>
    </MobileCalendarSidebarContext.Provider>
  );
}

export function MobileCalendarSidebarTrigger({ className }: { className?: string }) {
  const store = useContext(MobileCalendarSidebarContext);
  if (!store) return null;

  return (
    <IconButton
      className={`md:hidden ${className ?? ''}`}
      label="Open navigation"
      render={<Ariakit.DialogDisclosure store={store} />}
    >
      <Menu className="size-5" />
    </IconButton>
  );
}
