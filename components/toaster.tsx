'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'
import { ViewTransition } from 'react'

export function Toaster() {
  const { resolvedTheme } = useTheme()
  return (
    <ViewTransition name="toaster" default="none">
      <Sonner position="bottom-right" theme={resolvedTheme === 'light' ? 'light' : 'dark'} />
    </ViewTransition>
  )
}
