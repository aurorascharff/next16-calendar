'use client'

import * as Ariakit from '@ariakit/react'
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { deleteEvent, updateEvent } from '../calendar-actions'
import type { CalendarEvent, EventColor } from '../types/calendar'
import { formatDay } from '../calendar-utils'

type EventEditorProps = {
  event: CalendarEvent
  onClose: () => void
  onDeleted: (sourceId: string) => void
  onUpdated: (event: Pick<CalendarEvent, 'color' | 'duration' | 'sourceId' | 'start' | 'title'>) => void
}

const fieldLabel = 'text-muted mb-1.5 block text-xs font-medium'

export function EventEditor({ event, onClose, onDeleted, onUpdated }: EventEditorProps) {
  const [isPending, startTransition] = useTransition()
  const store = Ariakit.useDialogStore({
    defaultOpen: true,
    setOpen(open) {
      if (!open) onClose()
    },
  })

  function submit(formData: FormData) {
    const input = {
      color: String(formData.get('color')) as EventColor,
      duration: Number(formData.get('duration')),
      eventId: event.sourceId,
      start: String(formData.get('start')),
      title: String(formData.get('title')),
    }

    startTransition(async () => {
      const result = await updateEvent(input)
      if (result.error) {
        toast.error(result.error)
        return
      }

      onUpdated({ ...input, sourceId: event.sourceId })
      store.hide()
      toast.success(event.recurring ? 'Recurring event updated.' : 'Event updated.')
    })
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteEvent(event.sourceId)
      if (result.error) {
        toast.error(result.error)
        return
      }

      onDeleted(event.sourceId)
      store.hide()
      toast.success(event.recurring ? 'Recurring event removed.' : 'Event removed.')
    })
  }

  return (
    <Dialog store={store} title="Edit event" description={`${formatDay(event.day)} · ${event.start}`} busy={isPending}>
      {event.recurring ? (
        <p className="text-muted mt-3 rounded-md bg-card px-3 py-2 text-xs dark:bg-card-dark">
          This is a recurring event. Changes apply to each occurrence.
        </p>
      ) : null}
      <form action={submit} className="mt-4 space-y-4">
        <label className="block">
          <span className={fieldLabel}>Title</span>
          <input autoFocus defaultValue={event.title} name="title" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={fieldLabel}>Starts at</span>
            <input defaultValue={event.start} name="start" type="time" />
          </label>
          <label className="block">
            <span className={fieldLabel}>Duration</span>
            <select defaultValue={String(event.duration)} name="duration">
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">90 minutes</option>
              <option value="120">2 hours</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className={fieldLabel}>Color</span>
          <select defaultValue={event.color} name="color">
            <option value="blue">Blue</option>
            <option value="violet">Violet</option>
            <option value="amber">Amber</option>
            <option value="rose">Rose</option>
          </select>
        </label>
        <div className={cn('mt-6 flex items-center gap-3', event.recurring ? 'justify-end' : 'justify-between')}>
          {!event.recurring ? (
            <button
              className="text-danger inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-danger/10 disabled:opacity-60"
              disabled={isPending}
              onClick={remove}
              type="button"
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          ) : null}
          <div className="flex gap-2">
            <Ariakit.DialogDismiss
              className="text-muted rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-black disabled:opacity-50 dark:hover:text-white"
              disabled={isPending}
            >
              Cancel
            </Ariakit.DialogDismiss>
            <button
              className="rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}
