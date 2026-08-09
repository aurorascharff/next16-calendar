import { ViewTransition } from 'react';
import type { ReactNode } from 'react';

export function Crossfade({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="auto" enter="auto" exit="auto">
      {children}
    </ViewTransition>
  );
}
