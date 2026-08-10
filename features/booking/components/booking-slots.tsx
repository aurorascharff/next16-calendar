'use client';

import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import Link, { useLinkStatus } from 'next/link';
import { useActionState, useOptimistic, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Boundary } from '@/components/internal/boundary';
import { Button } from '@/components/ui/button';
import { DirectionalSlide } from '@/components/ui/directional-slide';
import { FlowMark } from '@/components/ui/flow-mark';
import { IconButton } from '@/components/ui/icon-button';
import { Input, RadioCard } from '@/components/ui/input';
import { formatDayLong, shiftDay } from '@/features/calendar/calendar-utils';
import { bookSlotAction, type BookSlotState } from '../booking-actions';
import type { BookingSlot } from '../booking-queries';
import type { Route } from 'next';

const dayHref = (handle: string, day: string) => `/book/${handle}?date=${day}` as Route;
type SelectedSlot = { day: string; time: string };

function DayNavigationIcon({ direction }: { direction: 'next' | 'previous' }) {
  const { pending } = useLinkStatus();

  if (pending) return <LoaderCircle className="size-4.5 animate-spin" />;
  return direction === 'previous' ? <ChevronLeft className="size-4.5" /> : <ChevronRight className="size-4.5" />;
}

function BookingConfirmation({
  day,
  duration,
  handle,
  time,
}: {
  day: string;
  duration: number;
  handle: string;
  time: string;
}) {
  return (
    <div className="flex min-h-72 flex-1 items-center justify-center py-6 sm:min-h-0">
      <div className="w-full max-w-sm text-center">
        <FlowMark animated className="mx-auto size-12" />
        <h2 className="mt-4 text-lg font-semibold">You&apos;re booked</h2>
        <p className="text-muted mt-2 text-sm">
          {formatDayLong(day)} at{' '}
          <span className="font-medium text-black tabular-nums dark:text-white">{time}</span>
        </p>
        <p className="text-muted mt-1 text-sm">{duration} minutes. A confirmation is on its way.</p>
        <Button className="mt-6" render={<Link href={dayHref(handle, day)} />} variant="secondary">
          Book another
        </Button>
      </div>
    </div>
  );
}

export function BookingSlots({
  bookedTime,
  day,
  duration,
  formId,
  handle,
  slots,
}: {
  bookedTime?: string;
  day: string;
  duration: number;
  formId: string;
  handle: string;
  slots: BookingSlot[];
}) {
  const [, formAction] = useActionState(async (previousState: BookSlotState, formData: FormData) => {
    const nextState = await bookSlotAction(previousState, formData);

    if (nextState?.error) toast.error(nextState.error);

    return nextState;
  }, null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [displayDay, setDisplayDay] = useOptimistic(day);
  const [, startTransition] = useTransition();
  const previousDay = shiftDay(day, -1);
  const nextDay = shiftDay(day, 1);

  const visibleSlots = slots.filter(slot => slot.reason !== 'calendar');
  const selected = selectedSlot?.day === day ? visibleSlots.find(slot => slot.time === selectedSlot.time) : null;
  const selectedAvailable = selected && !selected.taken ? selected : null;

  const allTaken = visibleSlots.length === 0 || visibleSlots.every(slot => slot.taken);

  function navigateDay(nextDay: string) {
    setSelectedSlot(null);
    startTransition(() => setDisplayDay(nextDay));
  }

  return (
    <Boundary label="BookingSlots" asChild>
      <div className="flex w-full flex-col sm:h-full sm:min-h-0">
        {bookedTime ? (
          <BookingConfirmation day={day} duration={duration} handle={handle} time={bookedTime} />
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
              <IconButton
                label="Previous day"
                render={
                  <Link
                    href={dayHref(handle, previousDay)}
                    onNavigate={() => navigateDay(previousDay)}
                    prefetch
                    transitionTypes={['nav-back']}
                  />
                }
              >
                <DayNavigationIcon direction="previous" />
              </IconButton>
              <span aria-live="polite" className="text-sm font-semibold tabular-nums">
                {formatDayLong(displayDay)}
              </span>
              <IconButton
                label="Next day"
                render={
                  <Link
                    href={dayHref(handle, nextDay)}
                    onNavigate={() => navigateDay(nextDay)}
                    prefetch
                    transitionTypes={['nav-forward']}
                  />
                }
              >
                <DayNavigationIcon direction="next" />
              </IconButton>
            </div>
            <form action={formAction} className="flex flex-col sm:min-h-0 sm:flex-1" id={formId}>
              <Input name="day" type="hidden" value={day} variant="unstyled" />
              <Input name="handle" type="hidden" value={handle} variant="unstyled" />
              <div className="mb-3 grid gap-3 sm:mb-4 sm:grid-cols-2">
                <label className="block min-w-0">
                  <span className="text-muted mb-1.5 block text-xs font-medium">Your name</span>
                  <Input autoComplete="name" name="guestName" placeholder="Name" required />
                </label>
                <label className="block min-w-0">
                  <span className="text-muted mb-1.5 block text-xs font-medium">Email</span>
                  <Input autoComplete="email" name="guestEmail" placeholder="you@example.com" required type="email" />
                </label>
              </div>
              <p className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">Choose a time</p>
              <DirectionalSlide key={day} name="booking-slots">
                <div className="min-h-0 overflow-visible py-1 sm:flex-1 sm:[scrollbar-gutter:stable] sm:overflow-y-auto sm:overscroll-contain sm:pr-1">
                  {allTaken ? (
                    <p className="text-muted border-divider dark:border-divider-dark flex h-full items-center justify-center rounded-md border border-dashed px-4 py-8 text-center text-sm">
                      No open {duration}-minute slots on this day. Try another date.
                    </p>
                  ) : (
                    <div className="grid auto-rows-[2.875rem] gap-2 p-px sm:grid-cols-2">
                      {visibleSlots.map(slot => (
                        <RadioCard
                          checked={selectedSlot?.day === day && selectedSlot.time === slot.time}
                          disabled={slot.taken}
                          key={slot.time}
                          name="slot"
                          onChange={() => setSelectedSlot({ day, time: slot.time })}
                          required
                          value={slot.time}
                        >
                          {slot.time}
                          {slot.taken ? <span className="ml-2 text-[11px] no-underline">Booked</span> : null}
                        </RadioCard>
                      ))}
                    </div>
                  )}
                </div>
              </DirectionalSlide>
              <div className="border-divider dark:border-divider-dark mt-auto grid min-h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t px-1 py-4">
                {selectedAvailable ? (
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tabular-nums">{selectedAvailable.time}</p>
                    <p className="text-muted text-xs">{duration} minutes</p>
                  </div>
                ) : null}
                <Button className="h-11 min-w-24 shrink-0 px-5" type="submit">
                  Book
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Boundary>
  );
}
