import { Suspense } from 'react'
import { BookingProfile, BookingProfileSkeleton } from '@/features/calendar/components/booking-profile'

export default function BookingPage(props: PageProps<'/book/[handle]'>) {
  return (
    <Suspense fallback={<BookingProfileSkeleton />}>
      {props.params.then(({ handle }) => <BookingProfile handle={handle} />)}
    </Suspense>
  )
}
