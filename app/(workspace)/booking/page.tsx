import { ExternalLink, Link2 } from 'lucide-react'
import Link from 'next/link'
import { CopyLinkButton } from '@/features/calendar/components/copy-link-button'

export default function BookingPage() {
  return (
    <main className="min-w-0 flex-1 overflow-auto">
      <header className="flex min-h-18 items-center border-b border-divider px-4 sm:px-6 dark:border-divider-dark">
        <div>
          <p className="text-muted text-xs font-medium">Availability</p>
          <h1 className="mt-0.5 text-lg font-semibold">Booking link</h1>
        </div>
      </header>
      <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="border-divider rounded-xl border bg-card/40 p-6 dark:border-divider-dark dark:bg-card-dark/30">
          <div className="mb-4 grid size-10 place-items-center rounded-lg bg-accent/15 text-accent">
            <Link2 className="size-5" />
          </div>
          <h2 className="text-base font-semibold">Focused conversation</h2>
          <p className="text-muted mt-1 text-sm">30-minute slots, weekdays 09:30–15:00.</p>
          <div className="border-divider mt-5 flex flex-wrap items-center gap-2 border-t pt-4 dark:border-divider-dark">
            <code className="text-muted flex-1 truncate rounded bg-card px-3 py-2 font-mono text-xs dark:bg-card-dark">
              cadence.dev/book/aurora
            </code>
            <CopyLinkButton path="/book/aurora" />
            <Link
              className="border-divider text-muted inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-card hover:text-black dark:border-divider-dark dark:hover:bg-card-dark dark:hover:text-white"
              href="/book/aurora"
              prefetch
            >
              <ExternalLink className="size-4" />
              Preview
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
