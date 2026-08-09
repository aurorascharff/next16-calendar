'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { bookSlot } from '../calendar-actions'

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function slotsBetween(startTime: string, endTime: string, duration: number) {
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  return Array.from(
    { length: Math.floor((toMinutes(endTime) - toMinutes(startTime)) / duration) },
    (_, index) => {
      const minutes = toMinutes(startTime) + index * duration
      return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
    },
  )
}

export function BookingSlots({
  duration,
  endTime,
  handle,
  startTime,
}: {
  duration: number
  endTime: string
  handle: string
  startTime: string
}) {
  const [isPending, startTransition] = useTransition()
  const [day, setDay] = useState(() => toDateKey(new Date()))
  const [guestName, setGuestName] = useState('')
  const slots = slotsBetween(startTime, endTime, duration)

  function selectSlot(slot: string) {
    startTransition(async () => {
      const result = await bookSlot({ day, guestName, handle, slot })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Booked ${slot}. A confirmation is on its way.`)
    })
  }

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="text-muted mb-1.5 block text-xs font-medium">Date</span>
          <input
            className="border-divider h-10 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus:border-primary dark:border-divider-dark"
            min={toDateKey(new Date())}
            onChange={(event) => setDay(event.target.value)}
            type="date"
            value={day}
          />
        </label>
        <label>
          <span className="text-muted mb-1.5 block text-xs font-medium">Your name</span>
          <input
            className="border-divider h-10 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus:border-primary dark:border-divider-dark"
            onChange={(event) => setGuestName(event.target.value)}
            placeholder="Name"
            value={guestName}
          />
        </label>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {slots.map((slot) => (
          <button
            className="border-divider text-muted rounded-md border px-4 py-3 text-left text-sm font-medium tabular-nums transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60 dark:border-divider-dark"
            disabled={isPending}
            key={slot}
            onClick={() => selectSlot(slot)}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  )
}
