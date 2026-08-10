import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Crossfade } from '@/components/ui/crossfade';
import ErrorBoundary from '@/components/ui/error-boundary';
import { FlowMark } from '@/components/ui/flow-mark';
import { getPublicBookingMetadata } from '@/features/booking/booking-queries';
import { BookingProfile, BookingProfileSkeleton } from '@/features/booking/components/booking-profile';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: PageProps<'/book/[handle]'>): Promise<Metadata> {
  const { handle } = await params;
  const booking = await getPublicBookingMetadata(handle);
  if (!booking) return { title: 'Booking' };

  const description = `Book a ${booking.duration}-minute time on Flow.`;
  return {
    description,
    openGraph: { description, siteName: 'Flow', title: booking.title, type: 'website' },
    title: booking.title,
  };
}

export default function BookingPage({ params, searchParams }: PageProps<'/book/[handle]'>) {
  return (
    <main className="bg-surface dark:bg-surface-dark grid min-h-svh items-start justify-items-center overflow-x-hidden px-3 py-3 sm:h-svh sm:min-h-0 sm:overflow-hidden sm:px-4 sm:py-8">
      <section className="border-divider bg-white dark:border-divider-dark dark:bg-card-dark flex w-full max-w-4xl flex-col rounded-lg border p-4 sm:p-6 md:h-[min(38rem,calc(100svh-4rem))] md:overflow-hidden">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link className="text-muted hover:text-accent inline-flex items-center gap-1.5 text-sm font-medium" href="/">
            <ChevronLeft className="size-4" />
            Flow
          </Link>
          <FlowMark animated className="size-10 shrink-0 sm:size-11" />
        </div>
        <div className="grid grid-rows-[auto_auto] md:min-h-0 md:flex-1 md:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.1fr)] md:grid-rows-[minmax(0,1fr)] md:gap-8">
          <ErrorBoundary title="Booking page unavailable">
            <Suspense fallback={<BookingProfileSkeleton />}>
              <Crossfade>
                {Promise.all([params, searchParams]).then(([{ handle }, { booked, date }]) => (
                  <BookingProfile
                    booked={typeof booked === 'string' ? booked : undefined}
                    date={typeof date === 'string' ? date : undefined}
                    handle={handle}
                  />
                ))}
              </Crossfade>
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </main>
  );
}
