import { Pencil } from 'lucide-react';
import { connection } from 'next/server';
import { dateKey, isDateKey } from '@/features/calendar/calendar-utils';
import { getBookingAvailability } from '../booking-queries';
import { BookingSlots } from './booking-slots';

export async function BookingProfile({ booked, date, handle }: { booked?: string; date?: string; handle: string }) {
  const day = await getBookingDay(date);
  const availability = await getBookingAvailability(handle, day);
  const bookedTime = booked && /^([01]\d|2[0-3]):[0-5]\d$/.test(booked) ? booked : undefined;
  const formId = 'public-booking-form';
  const editableTitle = availability.hasCalendar && !bookedTime;

  return (
    <>
      <div className="min-w-0">
        <p className="text-muted text-sm">{availability.name}</p>
        {editableTitle ? (
          <label className="mt-1 block">
            <span className="sr-only">Meeting title</span>
            <span className="relative block">
              <input
                aria-label="Meeting title"
                className="border-divider bg-card/35 hover:border-primary/45 focus:border-primary dark:border-divider-dark dark:bg-card-dark/35 dark:hover:border-primary/60 w-full rounded-md border px-3 py-2 pr-10 text-xl font-semibold tracking-tight focus:ring-0"
                defaultValue={availability.title}
                form={formId}
                name="title"
                required
              />
              <Pencil className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            </span>
          </label>
        ) : (
          <h1 className="mt-1 text-xl font-semibold tracking-tight">{availability.title}</h1>
        )}
        <p className="text-muted mt-1 text-sm">
          {availability.duration}-minute slots, {availability.startTime}–{availability.endTime}
        </p>
      </div>
      <div className="border-divider dark:border-divider-dark col-span-full mt-5 min-h-0 overflow-hidden border-t pt-5 sm:mt-8 sm:h-full sm:pt-6">
        {availability.hasCalendar ? (
          <BookingSlots
            bookedTime={bookedTime}
            day={availability.day}
            duration={availability.duration}
            formId={formId}
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
    </>
  );
}

async function getBookingDay(date?: string) {
  if (date && isDateKey(date)) return date;

  await connection();
  return dateKey(new Date());
}

export function BookingProfileSkeleton() {
  return (
    <>
      <div className="min-w-0 pt-1">
        <div className="bg-divider/70 dark:bg-divider-dark h-3 w-32 rounded-full" />
        <div className="bg-divider/70 dark:bg-divider-dark mt-3 h-5 w-3/4 max-w-80 rounded-full" />
        <div className="bg-divider/60 dark:bg-divider-dark mt-3 h-3 w-48 max-w-full rounded-full" />
      </div>
      <div className="col-span-full mt-8 space-y-3 sm:mt-10">
        <div className="bg-divider/60 dark:bg-divider-dark h-3 w-28 rounded-full" />
        <div className="bg-divider/50 dark:bg-divider-dark h-3 w-full max-w-sm rounded-full" />
      </div>
    </>
  );
}
