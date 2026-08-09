'use client'

import * as Ariakit from '@ariakit/react'
import { Trash2 } from 'lucide-react'
import { useActionState, useTransition } from 'react'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/dialog'
import { deleteEvent, updateEvent } from '../calendar-actions'
import type { CalendarEvent } from '../types/calendar'
import { formatDay } from '../calendar-utils'

type EventEditorProps = {
  event: CalendarEvent
  onClose: () => void
  onDeleted: (sourceId: string) => void
  onUpdated: (event: Pick<CalendarEvent, 'duration' | 'sourceId' | 'start' | 'title'>) => void
}

type State = { error?: string }

const fieldLabel = 'text-muted mb-1.5 block text-xs font-medium'

export function EventEditor({ event, onClose, onDeleted, onUpdated }: EventEditorProps) {
  const [isDeleting, startDelete] = useTransition()
  const store = Ariakit.useDialogStore({
    defaultOpen: true,
    setOpen(open) {
      if (!open) onClose()
    },
  })

  const [state, formAction, isSaving] = useActionState(async (_prev: State, formData: FormData): Promise<State> => {
    if (event.isDemo) return { error: 'This is a demo event and can’t be edited.' }
    const input = {
      duration: Number(formData.get('duration')),
      eventId: event.sourceId,
      start: String(formData.get('start')),
      title: String(formData.get('title')),
    }
    const result = await updateEvent(input)
    if (result.error) return { error: result.error }
    onUpdated({ ...input, sourceId: event.sourceId })
    store.hide()
    toast.success('Event updated.')
    return {}
  }, {})

  function remove() {
    if (event.isDemo) {
      toast.error('Demo events can’t be deleted.')
      return
    }
    startDelete(async () => {
      const result = await deleteEvent(event.sourceId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      onDeleted(event.sourceId)
      store.hide()
      toast.success('Event removed.')
    })
  }

  const busy = isSaving || isDeleting

  return (
    <Dialog store={store} title="Edit event" description={`${formatDay(event.day)} · ${event.start}`} busy={busy}>
      {event.isDemo ? (
        <p className="text-muted mt-3 rounded-md bg-card px-3 py-2 text-xs dark:bg-card-dark">
          This is a demo event — create your own to edit, move, resize, and delete freely.
        </p>
      ) : null}
      <form action={formAction} className="mt-4 space-y-4">
        <label className="block">
          <span className={fieldLabel}>Title</span>
          <input autoFocus defaultValue={event.title} disabled={event.isDemo} name="title" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={fieldLabel}>Starts at</span>
            <input defaultValue={event.start} disabled={event.isDemo} name="start" type="time" />
          </label>
          <label className="block">
            <span className={fieldLabel}>Duration</span>
            <select defaultValue={String(event.duration)} disabled={event.isDemo} name="duration">
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">90 minutes</option>
              <option value="120">2 hours</option>
            </select>
          </label>
        </div>
        {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            className="text-danger inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-danger/10 disabled:opacity-60"
            disabled={busy}
            onClick={remove}
            type="button"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
          <div className="flex gap-2">
            <Ariakit.DialogDismiss
              className="text-muted rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-black disabled:opacity-50 dark:hover:text-white"
              disabled={busy}
            >
              Cancel
            </Ariakit.DialogDismiss>
            <button
              className="rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
              disabled={busy || event.isDemo}
              type="submit"
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}
