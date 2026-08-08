'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { bookSlot } from '../calendar-actions'

export function BookingSlots({ handle, slots }: { handle: string; slots: string[] }) {
  const [isPending, startTransition] = useTransition()

  function selectSlot(slot: string) {
    startTransition(async () => {
      const result = await bookSlot({ handle, slot })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Held ${slot} for you. A confirmation is on its way.`)
    })
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {slots.map((slot) => (
        <button
          className="rounded-md border border-divider px-4 py-3 text-left text-sm font-medium text-muted transition-colors hover:border-primary hover:bg-primary/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-divider-dark"
          disabled={isPending}
          key={slot}
          onClick={() => selectSlot(slot)}
        >
          {slot}
        </button>
      ))}
    </div>
  )
}
