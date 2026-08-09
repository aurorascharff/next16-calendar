'use client';

import { useTheme } from 'next-themes';
import { ViewTransition } from 'react';
import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <ViewTransition name="toaster" default="none">
      <Sonner position="bottom-right" theme={resolvedTheme === 'light' ? 'light' : 'dark'} />
    </ViewTransition>
  );
}
