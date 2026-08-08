import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-6 text-center dark:bg-surface-dark">
      <div>
        <p className="text-muted text-sm">404</p>
        <h1 className="mt-2 text-xl font-semibold">That calendar page is not available.</h1>
        <Link className="mt-5 inline-flex rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white" href="/calendar/2026-08-10">
          Back to Pace
        </Link>
      </div>
    </main>
  )
}
