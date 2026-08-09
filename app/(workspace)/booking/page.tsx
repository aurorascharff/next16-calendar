import { Suspense } from 'react';
import { WorkspaceHeaderActions } from '@/components/workspace-header-actions';
import { BookingOverview, BookingOverviewFallback } from '@/features/booking/components/booking-overview';

export default function BookingPage() {
  return (
    <main className="min-w-0 flex-1 overflow-auto">
      <header className="border-divider dark:border-divider-dark flex min-h-18 items-center justify-between gap-4 border-b px-4 sm:px-6">
        <div>
          <p className="text-muted text-xs font-medium">Availability</p>
          <h1 className="mt-0.5 text-lg font-semibold">Booking link</h1>
        </div>
        <WorkspaceHeaderActions />
      </header>
      <section className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8 sm:px-6">
        <Suspense fallback={<BookingOverviewFallback />}>
          <BookingOverview />
        </Suspense>
      </section>
    </main>
  );
}
