'use client';

import { useCallback, useId, useLayoutEffect, useRef } from 'react';
import { DEFAULT_SCROLL_TOP } from '../utils/grid';
import type { ReactNode } from 'react';

export function CalendarScrollSection({ children, scrollKey }: { children: ReactNode; scrollKey: string }) {
  const id = useId();
  const ref = useRef<HTMLElement>(null);

  const setScrollRef = useCallback((node: HTMLElement | null) => {
    ref.current = node;
    if (node) node.scrollTop = DEFAULT_SCROLL_TOP;
  }, []);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = DEFAULT_SCROLL_TOP;
    }
  }, [scrollKey]);

  return (
    <>
      <section
        className="min-h-0 flex-1 overflow-auto [overflow-anchor:none]"
        data-calendar-scroll
        id={id}
        ref={setScrollRef}
      >
        {children}
      </section>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById(${JSON.stringify(id)})?.scrollTo(0, ${DEFAULT_SCROLL_TOP})`,
        }}
      />
    </>
  );
}
