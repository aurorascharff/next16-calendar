import { Suspense } from 'react'
import { BookingProfile, BookingProfileSkeleton } from '@/features/booking/components/booking-profile'

export default function BookingPage({ params, searchParams }: PageProps<'/book/[handle]'>) {
  return (
    <Suspense fallback={<BookingProfileSkeleton />}>
      {params.then(({ handle }) => searchParams.then(({ date }) => <BookingProfile date={typeof date === 'string' ? date : undefined} handle={handle} />))}
    </Suspense>
  )
}
