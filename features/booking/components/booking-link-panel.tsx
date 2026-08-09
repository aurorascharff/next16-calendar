import { Link2 } from 'lucide-react'
import { getBookingProfile } from '../booking-queries'
import { BookingLink } from './booking-link'

export async function BookingLinkPanel() {
  const profile = await getBookingProfile('aurora')

  return (
    <div className="border-divider rounded-xl border bg-card/40 p-6 dark:border-divider-dark dark:bg-card-dark/30">
      <div className="mb-4 grid size-10 place-items-center rounded-lg bg-accent/15 text-accent">
        <Link2 className="size-5" />
      </div>
      <h2 className="text-base font-semibold">{profile.title}</h2>
      <p className="text-muted mt-1 text-sm">
        {profile.duration}-minute slots, weekdays {profile.startTime}–{profile.endTime}.
      </p>
      <BookingLink handle={profile.handle} />
    </div>
  )
}

export function BookingLinkPanelSkeleton() {
  return <div className="border-divider h-44 animate-pulse rounded-xl border bg-card/40 dark:border-divider-dark dark:bg-card-dark/30" />
}
