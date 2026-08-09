'use client';

import { usePathname } from 'next/navigation';
import { ViewTransition } from 'react';

const nav = { 'nav-back': 'nav-back', 'nav-forward': 'nav-forward', default: 'none' };

export function RouteTransition({ children, slideKey }: { children: React.ReactNode; slideKey?: string }) {
  const pathname = usePathname();
  return (
    <ViewTransition default="none" enter={nav} exit={nav} key={slideKey ?? pathname}>
      {children}
    </ViewTransition>
  );
}
