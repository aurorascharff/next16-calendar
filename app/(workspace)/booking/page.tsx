import { Suspense } from 'react';
import { MobileCalendarSidebarTrigger } from '@/components/mobile-calendar-sidebar';
import { Crossfade } from '@/components/ui/crossfade';
import ErrorBoundary from '@/components/ui/error-boundary';
import {
  BookingLinkCard,
  BookingLinkDetails,
  BookingSectionSkeleton,
  BookingSettings,
  BookingSettingsCard,
} from '@/features/booking/components/booking-overview';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking link',
};

export default function BookingPage() {
  return (
    <main className="min-w-0 flex-1 overflow-auto">
      <header className="border-divider dark:border-divider-dark flex min-h-14 items-center justify-between gap-3 border-b px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <MobileCalendarSidebarTrigger className="-ml-1.5 shrink-0" />
          <h1 className="truncate text-lg font-semibold tracking-tight">Booking link</h1>
        </div>
        <p className="text-muted shrink-0 text-xs font-medium">Availability</p>
      </header>
      <section className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8 sm:px-6">
        <BookingLinkCard>
          <Suspense fallback={<BookingSectionSkeleton />}>
            <Crossfade>
              <BookingLinkDetails />
            </Crossfade>
          </Suspense>
        </BookingLinkCard>
        <BookingSettingsCard>
          <ErrorBoundary title="Settings unavailable">
            <Suspense fallback={<BookingSectionSkeleton />}>
              <Crossfade>
                <BookingSettings />
              </Crossfade>
            </Suspense>
          </ErrorBoundary>
        </BookingSettingsCard>
      </section>
    </main>
  );
}
