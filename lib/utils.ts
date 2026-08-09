import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Artificial latency so cache misses reveal the loading skeletons in the demo.
// Cached reads (`'use cache'`) skip this, so warm navigations stay instant.
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
