import { Suspense } from 'react'
import { BookingLinkPanel, BookingLinkPanelSkeleton } from '@/features/booking/components/booking-link-panel'
import { BookingSettings, BookingSettingsSkeleton } from '@/features/booking/components/booking-settings'

export default function BookingPage() {
  return (
    <main className="min-w-0 flex-1 overflow-auto">
      <header className="flex min-h-18 items-center border-b border-divider px-4 sm:px-6 dark:border-divider-dark">
        <div>
          <p className="text-muted text-xs font-medium">Availability</p>
          <h1 className="mt-0.5 text-lg font-semibold">Booking link</h1>
        </div>
      </header>
      <section className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8 sm:px-6">
        <Suspense fallback={<BookingLinkPanelSkeleton />}>
          <BookingLinkPanel />
        </Suspense>
        <Suspense fallback={<BookingSettingsSkeleton />}>
          <BookingSettings />
        </Suspense>
      </section>
    </main>
  )
}
