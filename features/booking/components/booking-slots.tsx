'use client';

import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { toast } from 'sonner';
import { buttonClasses } from '@/components/ui/button';
import { RouteTransition } from '@/components/ui/route-transition';
import { Spinner } from '@/components/ui/spinner';
import { formatDayLong, shiftDay } from '@/features/calendar/calendar-utils';
import { cn } from '@/lib/utils';
import { bookSlotAction, type BookSlotState } from '../booking-actions';
import type { BookingSlot } from '../booking-queries';
import type { Route } from 'next';

const dayHref = (handle: string, day: string) => `/book/${handle}?date=${day}` as Route;

export function BookingSlots({
  calendarName,
  day,
  duration,
  handle,
  slots,
}: {
  calendarName: string;
  day: string;
  duration: number;
  handle: string;
  slots: BookingSlot[];
}) {
  const [, formAction, isPending] = useActionState(async (previousState: BookSlotState, formData: FormData) => {
    const nextState = await bookSlotAction(previousState, formData);

    if (nextState?.error) toast.error(nextState.error);
    if (nextState?.success) toast.success(nextState.success);

    return nextState;
  }, null);
  const [guestName, setGuestName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const visibleSlots = slots.filter(slot => slot.reason !== 'calendar');
  const selected = selectedSlot ? visibleSlots.find(slot => slot.time === selectedSlot) : null;
  const selectedAvailable = selected && !selected.taken ? selected : null;

  const navButton =
    'text-muted flex size-8 items-center justify-center rounded-md hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white';
  const allTaken = visibleSlots.length === 0 || visibleSlots.every(slot => slot.taken);

  return (
    <div className="min-h-0 w-full sm:min-w-[32rem]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          aria-label="Previous day"
          className={navButton}
          href={dayHref(handle, shiftDay(day, -1))}
          prefetch
          transitionTypes={['nav-back']}
        >
          <ChevronLeft className="size-4.5" />
        </Link>
        <span className="text-sm font-semibold tabular-nums">{formatDayLong(day)}</span>
        <Link
          aria-label="Next day"
          className={navButton}
          href={dayHref(handle, shiftDay(day, 1))}
          prefetch
          transitionTypes={['nav-forward']}
        >
          <ChevronRight className="size-4.5" />
        </Link>
      </div>
      <form action={formAction} className="flex min-h-0 flex-col">
        <input name="day" type="hidden" value={day} />
        <input name="handle" type="hidden" value={handle} />
        <input name="slot" type="hidden" value={selectedAvailable?.time ?? ''} />
        <label className="mb-4 block">
          <span className="text-muted mb-1.5 block text-xs font-medium">Your name</span>
          <input
            autoComplete="name"
            name="guestName"
            onChange={event => setGuestName(event.target.value)}
            placeholder="Name"
            required
            value={guestName}
          />
        </label>
        <p className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">Choose a time</p>
        <RouteTransition slideKey={day}>
          <div className="min-h-0 [scrollbar-gutter:stable] overflow-y-auto pr-1 sm:max-h-80">
            {allTaken ? (
              <p className="text-muted border-divider dark:border-divider-dark rounded-md border border-dashed py-8 text-center text-sm">
                No open {duration}-minute slots on this day. Try another date.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {visibleSlots.map(slot =>
                  slot.taken ? (
                    <div
                      aria-disabled="true"
                      className="border-divider text-muted/50 dark:border-divider-dark rounded-md border px-4 py-3 text-left text-sm font-medium tabular-nums line-through"
                      key={slot.time}
                    >
                      {slot.time}
                      <span className="ml-2 text-[11px] no-underline">Booked</span>
                    </div>
                  ) : (
                    <button
                      aria-pressed={selectedSlot === slot.time}
                      className={cn(
                        'rounded-md border px-4 py-3 text-left text-sm font-medium tabular-nums transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
                        selectedSlot === slot.time
                          ? 'border-accent bg-accent/10 text-accent shadow-accent'
                          : 'border-divider text-muted hover:border-accent hover:bg-accent/10 hover:text-accent dark:border-divider-dark',
                      )}
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot.time)}
                      type="button"
                    >
                      {slot.time}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </RouteTransition>
        <div className="border-divider bg-card/60 dark:border-divider-dark dark:bg-card-dark/60 mt-4 flex min-h-16 items-center justify-between gap-3 rounded-lg border p-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold tabular-nums">{selectedAvailable?.time ?? 'Choose a time'}</p>
            <p className="text-muted text-xs">
              {selectedAvailable ? `${duration} minutes on ${calendarName}` : `${duration}-minute meeting`}
            </p>
          </div>
          <button aria-busy={isPending} className={buttonClasses({ className: 'h-10 shrink-0 px-4' })} type="submit">
            {isPending ? <Spinner className="size-4" /> : <Check className="size-4" />}
            {isPending ? 'Booking' : 'Book'}
          </button>
        </div>
      </form>
    </div>
  );
}
