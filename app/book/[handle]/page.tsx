import { CalendarCheck, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { BookingSlots } from '@/features/calendar/components/booking-slots'
import { getBookingProfile } from '@/features/calendar/calendar-queries'

export default function BookingPage(props: PageProps<'/book/[handle]'>) {
  return props.params.then(async ({ handle }) => {
    const profile = await getBookingProfile(handle)

    return (
      <main className="grid min-h-dvh place-items-center bg-surface px-4 py-8 dark:bg-surface-dark">
        <section className="w-full max-w-xl rounded-lg border border-divider bg-card/40 p-5 sm:p-8 dark:border-divider-dark dark:bg-card-dark/30">
          <Link className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white" href="/calendar/2026-08-10">
            <ChevronLeft className="size-4" />
            Pace
          </Link>
          <div className="mt-8 flex items-start gap-4">
            <div className="grid size-11 place-items-center rounded-full bg-primary/15 text-primary">
              <CalendarCheck className="size-5" />
            </div>
            <div>
              <p className="text-muted text-sm">{profile.name}</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">{profile.title}</h1>
              <p className="text-muted mt-2 text-sm leading-6">Choose a time that suits you. Pace will keep the rest of Aurora’s week protected.</p>
            </div>
          </div>
          <div className="border-divider mt-8 border-t pt-6 dark:border-divider-dark">
            <p className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">Thursday, 13 August</p>
            <BookingSlots handle={profile.handle} slots={profile.slots} />
          </div>
        </section>
      </main>
    )
  })
}
