import { ViewTransition } from 'react';

export function Crossfade({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      {children}
    </ViewTransition>
  );
}
