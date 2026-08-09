import { CalendarX } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-6 text-center dark:bg-surface-dark">
      <div className="flex flex-col items-center gap-3">
        <CalendarX className="text-muted size-8" strokeWidth={1.5} />
        <p className="text-muted text-sm">404</p>
        <h1 className="text-xl font-semibold tracking-tight">That page isn&apos;t on the calendar.</h1>
        <Link href="/" className="mt-1">
          <Button>Back to Pace</Button>
        </Link>
      </div>
    </main>
  )
}
