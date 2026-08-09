'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePrefetchDefault } from '@/components/demo/use-prefetch-default';
import type { Route } from 'next';

type Props<T extends string = string> = Omit<React.ComponentProps<typeof Link>, 'href' | 'prefetch'> & {
  href: Route<T> | URL;
};

export function HoverPrefetchLink<T extends string>({ href, onFocus, onMouseEnter, onTouchStart, ...props }: Props<T>) {
  const [intent, setIntent] = useState(false);
  const enabled = usePrefetchDefault() === true;

  return (
    <Link
      {...props}
      href={href as Route}
      onFocus={event => {
        setIntent(true);
        onFocus?.(event);
      }}
      onMouseEnter={event => {
        setIntent(true);
        onMouseEnter?.(event);
      }}
      onTouchStart={event => {
        setIntent(true);
        onTouchStart?.(event);
      }}
      prefetch={enabled && intent ? true : null}
    />
  );
}
