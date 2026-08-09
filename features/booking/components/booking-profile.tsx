import { CalendarCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { connection } from 'next/server';
import { dateKey, isDateKey } from '@/features/calendar/calendar-utils';
import { getBookingAvailability } from '../booking-queries';
import { BookingSlots } from './booking-slots';

export async function BookingProfile({ date, handle }: { date?: string; handle: string }) {
  const day = await getBookingDay(date);
  const availability = await getBookingAvailability(handle, day);

  return (
    <main className="bg-surface dark:bg-surface-dark grid min-h-dvh items-start justify-items-center px-4 py-8">
      <section className="border-divider bg-card/40 dark:border-divider-dark dark:bg-card-dark/30 w-full max-w-xl rounded-lg border p-5 sm:p-8">
        <Link
          className="text-muted hover:text-accent mb-7 inline-flex items-center gap-1.5 text-sm font-medium"
          href="/"
        >
          <ChevronLeft className="size-4" />
          Dayline
        </Link>
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
          {availability.hasCalendar ? (
            <BookingSlots
              day={availability.day}
              duration={availability.duration}
              handle={availability.handle}
              key={availability.day}
              slots={availability.slots}
            />
          ) : (
            <p className="text-muted border-divider dark:border-divider-dark flex min-h-40 items-center justify-center rounded-md border border-dashed px-4 py-8 text-center text-sm">
              This booking link is not accepting meetings yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

async function getBookingDay(date?: string) {
  if (date && isDateKey(date)) return date;

  await connection();
  return dateKey(new Date());
}

export function BookingProfileSkeleton() {
  return (
    <main className="bg-surface dark:bg-surface-dark grid min-h-dvh items-start justify-items-center px-4 py-8">
      <section className="w-full max-w-xl p-5 sm:p-8">
        <div className="skeleton-animation mb-7 h-4 w-20 rounded-full" />
        <div className="flex items-start gap-4">
          <div className="skeleton-animation size-11 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="skeleton-animation h-3 w-32 rounded-full" />
            <div className="skeleton-animation mt-3 h-5 w-3/4 max-w-80 rounded-full" />
            <div className="skeleton-animation mt-3 h-3 w-48 max-w-full rounded-full" />
          </div>
        </div>
        <div className="mt-10 space-y-3">
          <div className="skeleton-animation h-3 w-28 rounded-full" />
          <div className="skeleton-animation h-3 w-full max-w-sm rounded-full" />
        </div>
      </section>
    </main>
  );
}
