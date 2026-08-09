'use client';

import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import Link, { useLinkStatus } from 'next/link';
import { useActionState, useOptimistic, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { RouteTransition } from '@/components/ui/route-transition';
import { formatDayLong, shiftDay } from '@/features/calendar/calendar-utils';
import { cn } from '@/lib/utils';
import { bookSlotAction, type BookSlotState } from '../booking-actions';
import type { BookingSlot } from '../booking-queries';
import type { Route } from 'next';

const dayHref = (handle: string, day: string) => `/book/${handle}?date=${day}` as Route;

function DayNavigationIcon({ direction }: { direction: 'next' | 'previous' }) {
  const { pending } = useLinkStatus();

  if (pending) return <LoaderCircle className="size-4.5 animate-spin" />;
  return direction === 'previous' ? <ChevronLeft className="size-4.5" /> : <ChevronRight className="size-4.5" />;
}

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
  const [, formAction] = useActionState(async (previousState: BookSlotState, formData: FormData) => {
    const nextState = await bookSlotAction(previousState, formData);

    if (nextState?.error) toast.error(nextState.error);
    if (nextState?.success) toast.success(nextState.success);

    return nextState;
  }, null);
  const [guestName, setGuestName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [displayDay, setDisplayDay] = useOptimistic(day);
  const [, startTransition] = useTransition();
  const previousDay = shiftDay(day, -1);
  const nextDay = shiftDay(day, 1);

  const visibleSlots = slots.filter(slot => slot.reason !== 'calendar');
  const selected = selectedSlot ? visibleSlots.find(slot => slot.time === selectedSlot) : null;
  const selectedAvailable = selected && !selected.taken ? selected : null;

  const allTaken = visibleSlots.length === 0 || visibleSlots.every(slot => slot.taken);

  return (
    <div className="min-h-0 w-full sm:min-w-[32rem]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <IconButton
          label="Previous day"
          render={
            <Link
              href={dayHref(handle, previousDay)}
              onNavigate={() => startTransition(() => setDisplayDay(previousDay))}
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
              onNavigate={() => startTransition(() => setDisplayDay(nextDay))}
              prefetch
              transitionTypes={['nav-forward']}
            />
          }
        >
          <DayNavigationIcon direction="next" />
        </IconButton>
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
          <div className="min-h-0 [scrollbar-gutter:stable] overflow-y-auto pr-1 sm:h-80">
            {allTaken ? (
              <p className="text-muted border-divider dark:border-divider-dark flex min-h-40 items-center justify-center rounded-md border border-dashed px-4 py-8 text-center text-sm sm:h-full sm:min-h-0">
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
                          ? 'border-accent bg-accent/10 text-accent ring-accent/40 ring-1 ring-inset'
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
          <Button className="h-10 shrink-0 px-4" type="submit">
            Book
          </Button>
        </div>
      </form>
    </div>
  );
}
