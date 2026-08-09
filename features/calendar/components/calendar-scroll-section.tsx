'use client';

import { useLayoutEffect, useRef } from 'react';
import { DEFAULT_SCROLL_TOP } from '../utils/grid';
import type { ReactNode } from 'react';

export function CalendarScrollSection({ children, scrollKey }: { children: ReactNode; scrollKey: string }) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = DEFAULT_SCROLL_TOP;
    }
  }, [scrollKey]);

  return (
    <section className="min-h-0 flex-1 overflow-auto" data-calendar-scroll ref={ref}>
      {children}
    </section>
  );
}
