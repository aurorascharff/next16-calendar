'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { toast } from 'sonner';
import { Boundary } from '@/components/internal/boundary';
import { Button } from '@/components/ui/button';
import { DirectionalSlide } from '@/components/ui/directional-slide';
import { FlowMark } from '@/components/ui/flow-mark';
import { IconButton } from '@/components/ui/icon-button';
import { Input, RadioCard } from '@/components/ui/input';
import { formatDayLong, shiftDay } from '@/features/calendar/calendar-utils';
import { cn } from '@/lib/utils';
import { bookSlotAction, type BookSlotState } from '../booking-actions';
import type { BookingSlot } from '../booking-queries';
import type { Route } from 'next';
import type { ReactNode } from 'react';

const dayHref = (handle: string, day: string) => `/book/${handle}?date=${day}` as Route;
type SelectedSlot = { day: string; time: string };

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
          {formatDayLong(day)} at <span className="font-medium text-black tabular-nums dark:text-white">{time}</span>
        </p>
        <p className="text-muted mt-1 text-sm">
          Your {duration}-minute meeting is booked. A confirmation is on its way.
        </p>
        <Button className="mt-6" render={<Link href={dayHref(handle, day)} />} variant="secondary">
          Book another
        </Button>
      </div>
    </div>
  );
}

function BookingAction({
  className,
  duration,
  formId,
  selected,
}: {
  className?: string;
  duration: number;
  formId: string;
  selected?: BookingSlot | null;
}) {
  return (
    <div
      className={cn(
        'border-divider dark:border-divider-dark min-h-16 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t px-1 py-3',
        className,
      )}
    >
      {selected ? (
        <div className="min-w-0">
          <p className="text-sm font-semibold tabular-nums">{selected.time}</p>
          <p className="text-muted text-xs">{duration} minutes</p>
        </div>
      ) : null}
      <Button className="col-start-2 justify-self-end" form={formId} type="submit">
        Book
      </Button>
    </div>
  );
}

export function BookingSlots({
  bookedTime,
  children,
  day,
  duration,
  formId,
  handle,
  slots,
}: {
  bookedTime?: string;
  children: ReactNode;
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
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const displayDay = navigatingTo ?? day;
  const navigating = navigatingTo !== null && navigatingTo !== day;
  const previousDay = shiftDay(day, -1);
  const nextDay = shiftDay(day, 1);

  const visibleSlots = slots.filter(slot => slot.reason !== 'calendar');
  const selected = selectedSlot?.day === day ? visibleSlots.find(slot => slot.time === selectedSlot.time) : null;
  const selectedAvailable = selected && !selected.taken ? selected : null;

  const allTaken = visibleSlots.length === 0 || visibleSlots.every(slot => slot.taken);

  function navigateDay(nextDay: string) {
    setSelectedSlot(null);
    setNavigatingTo(nextDay);
  }

  return (
    <Boundary label="BookingSlots" asChild>
      <form
        action={formAction}
        className="col-span-full grid grid-rows-[auto_auto] md:min-h-0 md:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.1fr)] md:grid-rows-[minmax(0,1fr)] md:gap-8"
        id={formId}
      >
        <div className="flex min-w-0 flex-col md:min-h-0">
          {children}
          {!bookedTime ? (
            <BookingAction
              className="mt-6 hidden md:mt-auto md:grid"
              duration={duration}
              formId={formId}
              selected={selectedAvailable}
            />
          ) : null}
        </div>
        <div className="border-divider dark:border-divider-dark col-span-full mt-5 min-h-0 overflow-hidden border-t pt-5 sm:mt-8 sm:h-full sm:pt-6 md:col-span-1 md:col-start-2 md:row-start-1 md:mt-0 md:border-t-0 md:border-l md:pt-0 md:pl-8">
          <div className="flex w-full flex-col md:h-full md:min-h-0">
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
                        transitionTypes={['nav-back']}
                      />
                    }
                  >
                    <ChevronLeft className="size-4.5" />
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
                        transitionTypes={['nav-forward']}
                      />
                    }
                  >
                    <ChevronRight className="size-4.5" />
                  </IconButton>
                </div>
                <div className="flex flex-col md:min-h-0 md:flex-1 md:overflow-hidden">
                  <Input name="day" type="hidden" value={day} variant="unstyled" />
                  <Input name="handle" type="hidden" value={handle} variant="unstyled" />
                  <p className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">Choose a time</p>
                  <DirectionalSlide key={day} name="booking-slots">
                    <div
                      aria-busy={navigating}
                      className={cn(
                        'min-h-0 overflow-visible pt-1 pb-3 transition-opacity duration-150 md:flex-1 md:[scrollbar-gutter:stable] md:overflow-y-auto md:overscroll-contain md:pr-1',
                        navigating && 'pointer-events-none opacity-35',
                      )}
                    >
                      {allTaken ? (
                        <p className="text-muted border-divider dark:border-divider-dark flex h-full items-center justify-center rounded-md border border-dashed px-4 py-8 text-center text-sm">
                          No open {duration}-minute slots on this day. Try another date.
                        </p>
                      ) : (
                        <div className="grid auto-rows-[2.625rem] gap-2 p-px sm:grid-cols-2">
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
                  <BookingAction
                    className="mt-3 grid md:hidden"
                    duration={duration}
                    formId={formId}
                    selected={selectedAvailable}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </Boundary>
  );
}
