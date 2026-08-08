'use client'

import { Toaster as Sonner } from 'sonner'
import { ViewTransition } from 'react'

export function Toaster() {
  return (
    <ViewTransition name="toaster" default="none">
      <Sonner position="bottom-right" theme="dark" />
    </ViewTransition>
  )
}
