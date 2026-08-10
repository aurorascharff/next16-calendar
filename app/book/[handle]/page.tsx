import { CalendarCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Crossfade } from '@/components/ui/crossfade';
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
      <section className="border-divider bg-card/40 dark:border-divider-dark dark:bg-card-dark/30 flex w-full max-w-xl flex-col rounded-lg border p-4 sm:h-[min(50rem,calc(100svh-4rem))] sm:overflow-hidden sm:p-8">
        <Link
          className="text-muted hover:text-accent mb-5 inline-flex items-center gap-1.5 text-sm font-medium sm:mb-7"
          href="/"
        >
          <ChevronLeft className="size-4" />
          Flow
        </Link>
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] grid-rows-[auto_auto] gap-x-3 sm:min-h-0 sm:flex-1 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:grid-rows-[auto_minmax(0,1fr)] sm:gap-x-4">
          <div className="bg-primary/15 text-primary grid size-10 place-items-center rounded-full sm:size-11">
            <CalendarCheck className="size-5" />
          </div>
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
        </div>
      </section>
    </main>
  );
}
