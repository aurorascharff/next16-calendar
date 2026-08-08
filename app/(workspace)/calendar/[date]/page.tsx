import { Suspense } from 'react'
import { CalendarScreen, CalendarScreenSkeleton } from '@/features/calendar/components/calendar-screen'

export default function CalendarPage(props: PageProps<'/calendar/[date]'>) {
  return (
    <Suspense fallback={<CalendarScreenSkeleton />}>
      {props.params.then(({ date }) => <CalendarScreen date={date} />)}
    </Suspense>
  )
}
