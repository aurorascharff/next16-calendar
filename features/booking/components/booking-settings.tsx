import { getCurrentUser } from '@/features/user/user-queries';
import { getMyBookingSettings } from '../booking-queries';
import { BookingSettingsForm } from './booking-settings-form';

export async function BookingSettings() {
  const user = await getCurrentUser();
  if (!user) return null;

  const settings = await getMyBookingSettings(user.id, user.handle);

  return <BookingSettingsForm settings={settings} />;
}

export function BookingSettingsSkeleton() {
  return (
    <div className="border-divider bg-card/40 dark:border-divider-dark dark:bg-card-dark/30 h-80 animate-pulse rounded-lg border" />
  );
}
