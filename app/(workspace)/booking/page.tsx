import { Copy, ExternalLink, Link2, Plus } from 'lucide-react'
import Link from 'next/link'

export default function BookingPage() {
  return (
    <main className="min-w-0 flex-1 overflow-auto">
      <header className="flex min-h-18 items-center justify-between border-b border-divider px-4 sm:px-6 dark:border-divider-dark">
        <div>
          <p className="text-muted text-xs font-medium">Availability</p>
          <h1 className="mt-0.5 text-lg font-semibold">Booking links</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
          <Plus className="size-4" />
          New link
        </button>
      </header>
      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="border-divider rounded-lg border bg-card/50 p-5 dark:border-divider-dark dark:bg-card-dark/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 grid size-9 place-items-center rounded-md bg-primary/15 text-primary">
                <Link2 className="size-4" />
              </div>
              <h2 className="text-base font-semibold">Focused conversation</h2>
              <p className="text-muted mt-1 text-sm">30 minutes, weekdays from 09:30 to 15:00.</p>
            </div>
            <span className="rounded-full bg-success/15 px-2 py-1 text-xs font-medium text-success">Active</span>
          </div>
          <div className="border-divider mt-5 flex flex-wrap items-center gap-2 border-t pt-4 dark:border-divider-dark">
            <code className="bg-surface-dark/70 rounded px-2 py-1 text-xs text-gray">dayline.local/book/aurora</code>
            <Link
              className="inline-flex items-center gap-1.5 rounded-md border border-divider px-2.5 py-1.5 text-xs font-medium text-muted hover:text-white dark:border-divider-dark"
              href="/book/aurora"
              prefetch
            >
              <ExternalLink className="size-3.5" />
              Open
            </Link>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-divider px-2.5 py-1.5 text-xs font-medium text-muted hover:text-white dark:border-divider-dark">
              <Copy className="size-3.5" />
              Copy
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
