import { ViewTransition } from 'react';
import type { ReactNode } from 'react';

export function Crossfade({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="auto" default="none">
      {children}
    </ViewTransition>
  );
}
