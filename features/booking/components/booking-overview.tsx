import { Link2 } from 'lucide-react';
import { getCurrentUser } from '@/features/user/user-queries';
import { getMyBookingProfile, getMyBookingSettings } from '../booking-queries';
import { BookingLink } from './booking-link';
import { BookingSettingsForm } from './booking-settings-form';

export async function BookingOverview() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [profile, settings] = await Promise.all([
    getMyBookingProfile(user.handle),
    getMyBookingSettings(user.id, user.handle),
  ]);
  const acceptingMeetings = Boolean(profile?.active && profile.hasCalendar);

  return (
    <>
      <div className="border-divider bg-card/40 dark:border-divider-dark dark:bg-card-dark/30 rounded-lg border p-6">
        <div className="bg-accent/15 text-accent mb-4 grid size-10 place-items-center rounded-lg">
          <Link2 className="size-5" />
        </div>
        {profile ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold">{profile.title}</h2>
              {!profile.hasCalendar ? (
                <span className="bg-accent/10 text-accent rounded-full px-2 py-0.5 text-xs font-semibold">
                  Needs calendar
                </span>
              ) : !profile.active ? (
                <span className="bg-danger/10 text-danger rounded-full px-2 py-0.5 text-xs font-semibold">Paused</span>
              ) : null}
            </div>
            <p className="text-muted mt-1 text-sm">
              {!profile.hasCalendar
                ? 'Create a calendar to make this booking link available.'
                : profile.active
                  ? `${profile.duration}-minute slots, weekdays ${profile.startTime}-${profile.endTime}.`
                  : 'Your public booking page is paused until you turn it back on.'}
            </p>
            {acceptingMeetings ? <BookingLink handle={profile.handle} /> : null}
          </>
        ) : (
          <>
            <h2 className="text-base font-semibold">No booking link yet</h2>
            <p className="text-muted mt-1 text-sm">Set your availability to share a public booking page.</p>
          </>
        )}
      </div>
      <BookingSettingsForm settings={settings} />
    </>
  );
}

export function BookingOverviewSkeleton() {
  return (
    <>
      <div className="border-divider bg-card/40 dark:border-divider-dark dark:bg-card-dark/30 rounded-lg border p-6">
        <div className="skeleton-animation mb-4 size-10 rounded-lg" />
        <div className="skeleton-animation h-4 w-40 rounded-full" />
        <div className="skeleton-animation mt-3 h-3 w-64 max-w-full rounded-full" />
        <div className="skeleton-animation mt-5 h-10 rounded-md" />
      </div>
    </>
  );
}
