import { CalendarCheck } from 'lucide-react';
import { getBookingAvailability } from '../booking-queries';
import { BookingSlots } from './booking-slots';

export async function BookingProfile({ date, handle }: { date?: string; handle: string }) {
  const availability = await getBookingAvailability(handle, date);

  return (
    <main className="bg-surface dark:bg-surface-dark grid min-h-dvh place-items-center px-4 py-8">
      <section className="border-divider bg-card/40 dark:border-divider-dark dark:bg-card-dark/30 w-full max-w-xl rounded-lg border p-5 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="bg-primary/15 text-primary grid size-11 place-items-center rounded-full">
            <CalendarCheck className="size-5" />
          </div>
          <div>
            <p className="text-muted text-sm">{availability.name}</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">{availability.title}</h1>
            <p className="text-muted mt-1 text-sm">
              {availability.duration}-minute slots, {availability.startTime}–{availability.endTime}
            </p>
          </div>
        </div>
        <div className="border-divider dark:border-divider-dark mt-8 border-t pt-6">
          <BookingSlots
            day={availability.day}
            duration={availability.duration}
            handle={availability.handle}
            slots={availability.slots}
          />
        </div>
      </section>
    </main>
  );
}

export function BookingProfileSkeleton() {
  return (
    <main className="bg-surface dark:bg-surface-dark grid min-h-dvh place-items-center px-4 py-8">
      <div className="border-divider bg-card/40 dark:border-divider-dark dark:bg-card-dark/30 h-[38rem] w-full max-w-xl animate-pulse rounded-lg border" />
    </main>
  );
}
