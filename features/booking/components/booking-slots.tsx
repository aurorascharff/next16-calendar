'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { Route } from 'next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDayLong, shiftDay } from '@/features/calendar/calendar-utils'
import { bookSlot } from '../booking-actions'
import type { BookingSlot } from '../booking-queries'

const dayHref = (handle: string, day: string) => `/book/${handle}?date=${day}` as Route

export function BookingSlots({
  day,
  duration,
  handle,
  slots,
}: {
  day: string
  duration: number
  handle: string
  slots: BookingSlot[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [guestName, setGuestName] = useState('')

  function selectSlot(slot: string) {
    startTransition(async () => {
      const result = await bookSlot({ day, guestName, handle, slot })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Booked ${slot}. A confirmation is on its way.`)
      router.refresh()
    })
  }

  const navButton = 'text-muted flex size-8 items-center justify-center rounded-md hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white'
  const allTaken = slots.every((slot) => slot.taken)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link aria-label="Previous day" className={navButton} href={dayHref(handle, shiftDay(day, -1))}>
          <ChevronLeft className="size-4.5" />
        </Link>
        <span className="text-sm font-semibold tabular-nums">{formatDayLong(day)}</span>
        <Link aria-label="Next day" className={navButton} href={dayHref(handle, shiftDay(day, 1))}>
          <ChevronRight className="size-4.5" />
        </Link>
      </div>
      <label className="mb-4 block">
        <span className="text-muted mb-1.5 block text-xs font-medium">Your name</span>
        <input onChange={(event) => setGuestName(event.target.value)} placeholder="Name" value={guestName} />
      </label>
      <p className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">Choose a time</p>
      {allTaken ? (
        <p className="text-muted rounded-md border border-dashed border-divider py-8 text-center text-sm dark:border-divider-dark">
          No open {duration}-minute slots on this day. Try another date.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {slots.map((slot) => (
            <button
              className={cn(
                'rounded-md border px-4 py-3 text-left text-sm font-medium tabular-nums transition-colors',
                slot.taken
                  ? 'border-divider text-muted/50 line-through dark:border-divider-dark'
                  : 'border-divider text-muted hover:border-accent hover:bg-accent/10 hover:text-accent disabled:opacity-60 dark:border-divider-dark',
              )}
              disabled={slot.taken || isPending}
              key={slot.time}
              onClick={() => selectSlot(slot.time)}
              type="button"
            >
              {slot.time}
              {slot.taken ? <span className="ml-2 text-[11px] no-underline">Busy</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
