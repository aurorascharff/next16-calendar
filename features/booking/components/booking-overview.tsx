import { Link2 } from 'lucide-react';
import { Suspense, type ReactNode } from 'react';
import { Crossfade } from '@/components/ui/crossfade';
import { NewCalendarButton } from '@/features/calendar/components/calendar-manager';
import { getMyBookingSettings, getMyBookingSummary } from '../booking-queries';
import { BookingLink } from './booking-link';
import { BookingSettingsForm } from './booking-settings-form';

export async function BookingOverview() {
  const profile = await getMyBookingSummary();

  return (
    <>
      <BookingLinkCard>
        <BookingLinkDetailsContent profile={profile} />
      </BookingLinkCard>
      <Suspense fallback={<BookingSettingsSkeleton />}>
        <BookingSettings />
      </Suspense>
    </>
  );
}

export function BookingLinkCard({ children }: { children: ReactNode }) {
  return (
    <div className="border-divider bg-card/40 dark:border-divider-dark dark:bg-card-dark/30 min-h-44 rounded-lg border p-6">
      <div className="bg-accent/15 text-accent mb-4 grid size-10 place-items-center rounded-lg">
        <Link2 className="size-5" />
      </div>
      {children}
    </div>
  );
}

function BookingLinkDetailsContent({ profile }: { profile: Awaited<ReturnType<typeof getMyBookingSummary>> }) {
  const acceptingMeetings = Boolean(profile?.active && profile.hasCalendar);

  return (
    <Crossfade>
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
    </Crossfade>
  );
}

export function BookingOverviewFallback() {
  return (
    <BookingLinkCard>
      <BookingLinkDetailsSkeleton />
    </BookingLinkCard>
  );
}

export async function BookingSettings() {
  const settings = await getMyBookingSettings();

  return (
    <Crossfade>
      <BookingSettingsForm settings={settings} />
    </Crossfade>
  );
}

export function BookingLinkDetailsSkeleton() {
  return (
    <>
      <div className="skeleton-animation h-4 w-44 rounded-full" />
      <div className="skeleton-animation mt-3 h-3 w-64 max-w-full rounded-full" />
    </>
  );
}

export function BookingSettingsSkeleton() {
  return (
    <div className="border-divider bg-card/40 dark:border-divider-dark dark:bg-card-dark/30 min-h-[19rem] rounded-lg border p-5">
      <div className="skeleton-animation h-4 w-44 rounded-full" />
      <div className="skeleton-animation mt-3 h-3 w-64 max-w-full rounded-full" />
    </div>
  );
}
