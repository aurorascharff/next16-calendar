'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import { Boundary } from '@/components/internal/boundary';
import { FlowMark } from '@/components/ui/flow-mark';
import { DEFAULT_SCROLL_TOP } from '../utils/grid';
import type { ReactNode } from 'react';

export function CalendarBoardViewport({ children }: { children: ReactNode }) {
  return (
    <Boundary label="CalendarBoard" asChild>
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </Boundary>
  );
}

export function CalendarViewFallback() {
  return (
    <CalendarBoardViewport>
      <div className="grid min-h-0 flex-1 place-items-center" role="status" aria-label="Loading calendar view">
        <FlowMark animated className="size-28 opacity-70 drop-shadow-[0_12px_28px_rgb(27_80_255/0.16)]" />
      </div>
    </CalendarBoardViewport>
  );
}

export function CalendarScrollSection({ children, scrollKey }: { children: ReactNode; scrollKey: string }) {
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
    <section className="min-h-0 flex-1 overflow-auto [overflow-anchor:none]" data-calendar-scroll ref={setScrollRef}>
      {children}
    </section>
  );
}
