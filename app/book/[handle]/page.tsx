import { Suspense } from 'react'
import { BookingProfile, BookingProfileSkeleton } from '@/features/calendar/components/booking-profile'

export default function BookingPage({ params }: PageProps<'/book/[handle]'>) {
  return (
    <Suspense fallback={<BookingProfileSkeleton />}>
      {params.then(({ handle }) => <BookingProfile handle={handle} />)}
    </Suspense>
  )
}
