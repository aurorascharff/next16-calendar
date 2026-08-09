import { Suspense } from 'react';
import { Crossfade } from '@/components/ui/crossfade';
import {
  BookingProfile,
  BookingProfileShell,
  BookingProfileSkeleton,
} from '@/features/booking/components/booking-profile';

export default function BookingPage({ params, searchParams }: PageProps<'/book/[handle]'>) {
  return (
    <BookingProfileShell>
      <Crossfade>
        <Suspense fallback={<BookingProfileSkeleton />}>
          {params.then(({ handle }) =>
            searchParams.then(({ booked, date }) => (
              <BookingProfile
                booked={typeof booked === 'string' ? booked : undefined}
                date={typeof date === 'string' ? date : undefined}
                handle={handle}
              />
            )),
          )}
        </Suspense>
      </Crossfade>
    </BookingProfileShell>
  );
}
