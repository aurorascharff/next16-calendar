import { connection } from 'next/server';
import { Input } from '@/components/ui/input';
import { dateKey, isDateKey } from '@/features/calendar/calendar-utils';
import { getBookingAvailability } from '../booking-queries';
import { BookingSlots } from './booking-slots';
import { BookingTitle } from './booking-title';

export async function BookingProfile({ booked, date, handle }: { booked?: string; date?: string; handle: string }) {
  const day = await getBookingDay(date);
  const availability = await getBookingAvailability(handle, day);
  const bookedTime = booked && /^([01]\d|2[0-3]):[0-5]\d$/.test(booked) ? booked : undefined;
  const formId = 'public-booking-form';
  const editableTitle = availability.hasCalendar && !bookedTime;

  return (
    <>
      <div className="min-w-0">
        <p className="text-muted truncate text-sm leading-5">{availability.name}</p>
        {editableTitle ? (
          <BookingTitle defaultValue={availability.title} formId={formId} />
        ) : (
          <h1 className="mt-1 flex min-h-12 items-center text-base leading-5 font-semibold tracking-tight sm:min-h-14 sm:text-xl sm:leading-7">
            {availability.title}
          </h1>
        )}
        <p className="text-muted mt-1 text-sm">
          {availability.duration}-minute slots, {availability.startTime}–{availability.endTime}
        </p>
        {!bookedTime ? (
          <div className="mt-6 grid gap-3">
            <label className="block min-w-0">
              <span className="text-muted mb-1.5 block text-xs font-medium">Your name</span>
              <Input autoComplete="name" form={formId} name="guestName" placeholder="Name" required />
            </label>
            <label className="block min-w-0">
              <span className="text-muted mb-1.5 block text-xs font-medium">Email</span>
              <Input
                autoComplete="email"
                form={formId}
                name="guestEmail"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
          </div>
        ) : null}
      </div>
      <div className="border-divider dark:border-divider-dark col-span-full mt-5 min-h-0 overflow-hidden border-t pt-5 sm:mt-8 sm:h-full sm:pt-6 md:col-span-1 md:col-start-2 md:row-start-1 md:mt-0 md:border-t-0 md:border-l md:pt-0 md:pl-8">
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
      <div className="min-w-0 pt-1 md:pt-2">
        <div className="bg-divider/70 dark:bg-divider-dark h-3 w-32 rounded-full" />
        <div className="bg-divider/70 dark:bg-divider-dark mt-3 h-5 w-3/4 max-w-80 rounded-full" />
        <div className="bg-divider/60 dark:bg-divider-dark mt-3 h-3 w-48 max-w-full rounded-full" />
      </div>
      <div className="border-divider dark:border-divider-dark col-span-full mt-8 space-y-3 sm:mt-10 md:col-span-1 md:col-start-2 md:row-start-1 md:mt-0 md:border-l md:pl-8">
        <div className="bg-divider/60 dark:bg-divider-dark h-3 w-28 rounded-full" />
        <div className="bg-divider/50 dark:bg-divider-dark h-3 w-full max-w-sm rounded-full" />
      </div>
    </>
  );
}
