'use client'

import { X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createEvent } from '../calendar-actions'

export function NewEventButton({ day }: { day: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await createEvent({
        day,
        start: String(formData.get('start')),
        title: String(formData.get('title')),
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      setOpen(false)
      toast.success('Event added to your calendar.')
    })
  }

  return (
    <>
      <button
        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        onClick={() => setOpen(true)}
      >
        <span className="text-base leading-none">+</span>
        <span className="hidden sm:inline">New event</span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <form action={submit} className="w-full max-w-sm rounded-lg border border-divider bg-surface p-5 shadow-2xl dark:border-divider-dark dark:bg-surface-dark">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-muted text-xs font-medium">{day}</p>
                <h2 className="mt-1 text-lg font-semibold">New event</h2>
              </div>
              <button
                aria-label="Close new event"
                className="rounded p-1 text-muted hover:bg-card hover:text-white dark:hover:bg-card-dark"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
            <label className="mt-6 block">
              <span className="text-muted mb-1.5 block text-xs font-medium">Title</span>
              <input
                autoFocus
                className="border-divider w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-divider-dark"
                name="title"
                placeholder="What is happening?"
              />
            </label>
            <label className="mt-4 block">
              <span className="text-muted mb-1.5 block text-xs font-medium">Starts at</span>
              <input
                className="border-divider w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-divider-dark"
                defaultValue="10:00"
                name="start"
                type="time"
              />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-white" onClick={() => setOpen(false)} type="button">
                Cancel
              </button>
              <button className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={isPending}>
                {isPending ? 'Saving...' : 'Create event'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  )
}
