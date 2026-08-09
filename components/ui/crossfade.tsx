import { ViewTransition } from 'react'

// Crossfades content in when a Suspense boundary reveals it, so streamed data
// fades in place instead of popping and shifting the layout.
export function Crossfade({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="auto" default="none">
      {children}
    </ViewTransition>
  )
}
