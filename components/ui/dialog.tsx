'use client';

import * as Ariakit from '@ariakit/react';
import { X } from 'lucide-react';

type Props = {
  store: Ariakit.DialogStore;
  title: string;
  description?: string;
  children: React.ReactNode;
  busy?: boolean;
  initialFocus?: Ariakit.DialogProps['initialFocus'];
};

export function Dialog({ store, title, description, children, busy = false, initialFocus }: Props) {
  return (
    <Ariakit.Dialog
      store={store}
      initialFocus={initialFocus}
      unmountOnHide
      hideOnInteractOutside={!busy}
      hideOnEscape={!busy}
      backdrop={
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm dark:bg-black/60"
          style={{ viewTransitionName: 'dialog-backdrop' }}
        />
      }
      className="border-divider dark:border-divider-dark bg-surface dark:bg-surface-dark fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col rounded-t-2xl border p-5 shadow-2xl outline-none sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:rounded-2xl"
      style={{ viewTransitionName: 'dialog' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Ariakit.DialogHeading className="text-lg font-semibold tracking-tight">{title}</Ariakit.DialogHeading>
          {description ? (
            <Ariakit.DialogDescription className="text-muted mt-0.5 text-sm">{description}</Ariakit.DialogDescription>
          ) : null}
        </div>
        <Ariakit.DialogDismiss
          aria-label="Close"
          className="text-muted hover:bg-card dark:hover:bg-card-dark -mr-1 rounded-md p-1 transition-colors hover:text-black dark:hover:text-white"
          disabled={busy}
        >
          <X className="size-4" />
        </Ariakit.DialogDismiss>
      </div>
      {children}
    </Ariakit.Dialog>
  );
}
