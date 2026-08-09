import { Link2 } from 'lucide-react'
import { getCurrentUser } from '@/features/user/user-queries'
import { getMyBookingProfile } from '../booking-queries'
import { BookingLink } from './booking-link'

export async function BookingLinkPanel() {
  const user = await getCurrentUser()
  if (!user) return null
  const profile = await getMyBookingProfile(user.handle)

  return (
    <div className="border-divider rounded-xl border bg-card/40 p-6 dark:border-divider-dark dark:bg-card-dark/30">
      <div className="mb-4 grid size-10 place-items-center rounded-lg bg-accent/15 text-accent">
        <Link2 className="size-5" />
      </div>
      {profile ? (
        <>
          <h2 className="text-base font-semibold">{profile.title}</h2>
          <p className="text-muted mt-1 text-sm">
            {profile.duration}-minute slots, weekdays {profile.startTime}–{profile.endTime}.
          </p>
          <BookingLink handle={profile.handle} />
        </>
      ) : (
        <>
          <h2 className="text-base font-semibold">No booking link yet</h2>
          <p className="text-muted mt-1 text-sm">Set your availability to share a public booking page.</p>
        </>
      )}
    </div>
  )
}

export function BookingLinkPanelSkeleton() {
  return <div className="border-divider h-44 animate-pulse rounded-xl border bg-card/40 dark:border-divider-dark dark:bg-card-dark/30" />
}
