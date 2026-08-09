import { ViewTransition } from 'react';

const nav = { 'nav-back': 'nav-back', 'nav-forward': 'nav-forward', default: 'none' };

export function RouteTransition({ children, slideKey }: { children: React.ReactNode; slideKey: string }) {
  return (
    <ViewTransition default="none" enter={nav} exit={nav} key={slideKey}>
      {children}
    </ViewTransition>
  );
}
