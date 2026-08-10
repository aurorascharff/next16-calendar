import { Link2 } from 'lucide-react';
import { type ReactNode } from 'react';
import { NewCalendarButton } from '@/features/calendar/components/calendar-manager';
import { getMyBookingOverview } from '../booking-queries';
import { BookingLink } from './booking-link';
import { BookingSettingsForm } from './booking-settings-form';

export async function BookingLinkDetails() {
  const { profile } = await getMyBookingOverview();

  return <BookingLinkDetailsContent profile={profile} />;
}

export function BookingLinkCard({ children }: { children: ReactNode }) {
  return (
    <div className="border-divider dark:border-divider-dark dark:bg-card-dark min-h-72 rounded-lg border bg-white p-6">
      <div className="bg-card text-muted dark:bg-card-dark mb-4 grid size-10 place-items-center rounded-lg">
        <Link2 className="size-5" />
      </div>
      {children}
    </div>
  );
}

export function BookingSettingsCard({ children }: { children: ReactNode }) {
  return (
    <div className="border-divider dark:border-divider-dark dark:bg-card-dark flex min-h-[26rem] flex-col rounded-lg border bg-white p-5">
      {children}
    </div>
  );
}

function BookingLinkDetailsContent({
  profile,
}: {
  profile: Awaited<ReturnType<typeof getMyBookingOverview>>['profile'];
}) {
  const acceptingMeetings = Boolean(profile?.active && profile.hasCalendar);

  return (
    <>
      {profile ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">{profile.title}</h2>
              {profile.hasCalendar && !profile.active ? (
                <span className="bg-danger/10 text-danger mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold">
                  Paused
                </span>
              ) : null}
            </div>
            {!profile.hasCalendar ? <NewCalendarButton className="shrink-0">Add calendar</NewCalendarButton> : null}
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
    </>
  );
}

export async function BookingSettings() {
  const { settings } = await getMyBookingOverview();

  return <BookingSettingsForm settings={settings} />;
}

export function BookingSectionSkeleton() {
  return (
    <div className="pt-1">
      <div className="bg-divider/70 dark:bg-divider-dark h-4 w-44 rounded-full" />
      <div className="bg-divider/60 dark:bg-divider-dark mt-3 h-3 w-64 max-w-full rounded-full" />
    </div>
  );
}
