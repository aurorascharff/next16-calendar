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
import { formatDayLong, shiftDay } from '@/features/calendar/calendar-utils';
import { cn } from '@/lib/utils';
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

export function BookingSlots({
  booked,
  day,
  duration,
  handle,
  slots,
  title,
}: {
  booked?: string;
  day: string;
  duration: number;
  handle: string;
  slots: BookingSlot[];
  title: string;
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
  const bookedTime = booked && /^([01]\d|2[0-3]):[0-5]\d$/.test(booked) ? booked : null;

  const allTaken = visibleSlots.length === 0 || visibleSlots.every(slot => slot.taken);

  function navigateDay(nextDay: string) {
    setSelectedSlot(null);
    startTransition(() => setDisplayDay(nextDay));
  }

  return (
    <Boundary label="BookingSlots" asChild>
      <div className="flex h-full min-h-0 w-full flex-col">
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
        {bookedTime ? (
          <div className="border-divider bg-card/60 dark:border-divider-dark dark:bg-card-dark/60 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <FlowMark animated className="size-9 shrink-0" />
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold">You&apos;re booked</p>
                <p className="text-muted mt-1 text-sm">
                  {formatDayLong(day)} at{' '}
                  <span className="font-medium text-black tabular-nums dark:text-white">{bookedTime}</span>
                </p>
                <p className="text-muted mt-1 text-xs">{duration} minutes. A confirmation is on its way.</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button render={<Link href={dayHref(handle, day)} />} variant="secondary">
                Book another
              </Button>
            </div>
          </div>
        ) : (
          <form action={formAction} className="flex min-h-0 flex-1 flex-col">
            <input name="day" type="hidden" value={day} />
            <input name="handle" type="hidden" value={handle} />
            <input name="slot" type="hidden" value={selectedAvailable?.time ?? ''} />
            <div className="mb-3 grid gap-3 sm:mb-4 sm:grid-cols-2">
              <label className="block min-w-0">
                <span className="text-muted mb-1.5 block text-xs font-medium">Your name</span>
                <input autoComplete="name" name="guestName" placeholder="Name" required />
              </label>
              <label className="block min-w-0">
                <span className="text-muted mb-1.5 block text-xs font-medium">Email</span>
                <input autoComplete="email" name="guestEmail" placeholder="you@example.com" required type="email" />
              </label>
              <label className="block min-w-0 sm:col-span-2">
                <span className="text-muted mb-1.5 block text-xs font-medium">Meeting title</span>
                <input defaultValue={title} name="title" required />
              </label>
            </div>
            <p className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">Choose a time</p>
            <DirectionalSlide key={day} name="booking-slots">
              <div className="min-h-0 flex-1 [scrollbar-gutter:stable] overflow-y-auto overscroll-contain py-1 pr-1">
                {allTaken ? (
                  <p className="text-muted border-divider dark:border-divider-dark flex min-h-40 items-center justify-center rounded-md border border-dashed px-4 py-8 text-center text-sm sm:h-full sm:min-h-0">
                    No open {duration}-minute slots on this day. Try another date.
                  </p>
                ) : (
                  <div className="grid gap-2 p-px sm:grid-cols-2">
                    {visibleSlots.map(slot =>
                      slot.taken ? (
                        <div
                          aria-disabled="true"
                          className="border-divider bg-card/35 text-muted/50 dark:border-divider-dark dark:bg-card-dark/35 rounded-md border px-4 py-3 text-left text-sm font-medium tabular-nums line-through"
                          key={slot.time}
                        >
                          {slot.time}
                          <span className="ml-2 text-[11px] no-underline">Booked</span>
                        </div>
                      ) : (
                        <button
                          aria-pressed={selectedSlot?.day === day && selectedSlot.time === slot.time}
                          className={cn(
                            'focus-visible:ring-primary/25 rounded-md border bg-transparent px-4 py-3 text-left text-sm font-medium tabular-nums transition-[background-color,border-color,color,transform] duration-150 ease-out focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
                            selectedSlot?.day === day && selectedSlot.time === slot.time
                              ? 'border-primary text-black shadow-[inset_0_0_0_1px_var(--color-primary)] dark:text-white'
                              : 'border-divider text-muted hover:border-primary/45 dark:border-divider-dark dark:hover:border-primary/60 hover:text-black dark:hover:text-white',
                          )}
                          key={slot.time}
                          onClick={() => setSelectedSlot({ day, time: slot.time })}
                          type="button"
                        >
                          {slot.time}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            </DirectionalSlide>
            <div className="border-divider bg-card/60 dark:border-divider-dark dark:bg-card-dark/60 mt-4 flex min-h-16 items-center justify-between gap-3 rounded-lg border p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold tabular-nums">{selectedAvailable?.time ?? 'Choose a time'}</p>
                <p className="text-muted text-xs">
                  {selectedAvailable ? `${duration} minutes` : `${duration}-minute meeting`}
                </p>
              </div>
              <Button className="h-10 shrink-0 px-4" disabled={!selectedAvailable} type="submit">
                Book
              </Button>
            </div>
          </form>
        )}
      </div>
    </Boundary>
  );
}
