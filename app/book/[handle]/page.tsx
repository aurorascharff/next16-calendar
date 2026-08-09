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

  const description = `Book a ${booking.duration}-minute time on Dayline.`;
  return {
    description,
    openGraph: { description, siteName: 'Dayline', title: booking.title, type: 'website' },
    title: booking.title,
  };
}

export default function BookingPage({ params, searchParams }: PageProps<'/book/[handle]'>) {
  return (
    <main className="bg-surface dark:bg-surface-dark grid h-svh items-start justify-items-center overflow-hidden px-3 py-3 sm:min-h-dvh sm:px-4 sm:py-8">
      <section className="border-divider bg-card/40 dark:border-divider-dark dark:bg-card-dark/30 flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-lg border p-4 sm:p-8">
        <Link
          className="text-muted hover:text-accent mb-5 inline-flex items-center gap-1.5 text-sm font-medium sm:mb-7"
          href="/"
        >
          <ChevronLeft className="size-4" />
          Dayline
        </Link>
        <div className="grid min-h-0 flex-1 grid-cols-[2.5rem_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] gap-x-3 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-x-4">
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
