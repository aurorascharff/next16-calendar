import { CalendarCheck, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { getBookingProfile } from '../calendar-queries'
import { BookingSlots } from './booking-slots'

export async function BookingProfile({ handle }: { handle: string }) {
  const profile = await getBookingProfile(handle)

  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-4 py-8 dark:bg-surface-dark">
      <section className="w-full max-w-xl rounded-lg border border-divider bg-card/40 p-5 sm:p-8 dark:border-divider-dark dark:bg-card-dark/30">
        <Link className="text-muted inline-flex items-center gap-1.5 text-sm transition-colors hover:text-black dark:hover:text-white" href="/">
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
          </div>
        </div>
        <div className="border-divider mt-8 border-t pt-6 dark:border-divider-dark">
          <p className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">Choose a time</p>
          <BookingSlots
            duration={profile.duration}
            endTime={profile.endTime}
            handle={profile.handle}
            startTime={profile.startTime}
          />
        </div>
      </section>
    </main>
  )
}

export function BookingProfileSkeleton() {
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-4 py-8 dark:bg-surface-dark">
      <div className="h-[38rem] w-full max-w-xl animate-pulse rounded-lg border border-divider bg-card/40 dark:border-divider-dark dark:bg-card-dark/30" />
    </main>
  )
}
