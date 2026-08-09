'use client'

import * as Ariakit from '@ariakit/react'
import { Trash2, X } from 'lucide-react'
import { useActionState, useTransition } from 'react'
import { toast } from 'sonner'
import { deleteEvent, updateEvent } from '../calendar-actions'
import type { CalendarEvent } from '../types/calendar'
import { formatDay } from '../calendar-utils'

type EventEditorProps = {
  event: CalendarEvent
  onClose: () => void
  onDeleted: (sourceId: string) => void
  onUpdated: (event: Pick<CalendarEvent, 'allDay' | 'duration' | 'sourceId' | 'start' | 'title'>) => void
}

type State = { error?: string }

const fieldLabel = 'text-muted mb-1.5 block text-xs font-medium'

export function EventEditor({ event, onClose, onDeleted, onUpdated }: EventEditorProps) {
  const [isDeleting, startDelete] = useTransition()
  const store = Ariakit.usePopoverStore({
    defaultOpen: true,
    placement: 'bottom-start',
    setOpen(open) {
      if (!open) onClose()
    },
  })

  const [state, formAction, isSaving] = useActionState(async (_prev: State, formData: FormData): Promise<State> => {
    const allDay = formData.get('allDay') === 'on'
    const input = {
      allDay,
      duration: Number(formData.get('duration')),
      eventId: event.sourceId,
      start: String(formData.get('start')),
      title: String(formData.get('title')),
    }
    const result = await updateEvent(input)
    if (result.error) return { error: result.error }
    onUpdated({ allDay, duration: input.duration, sourceId: event.sourceId, start: input.start, title: input.title })
    store.hide()
    toast.success('Event updated.')
    return {}
  }, {})

  function remove() {
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
    <Ariakit.Popover
      store={store}
      unmountOnHide
      fixed
      fitViewport
      gutter={10}
      hideOnEscape={!busy}
      hideOnInteractOutside={!busy}
      className="border-divider z-50 w-[min(24rem,calc(100vw-2rem))] rounded-lg border bg-surface p-4 shadow-2xl outline-none dark:border-divider-dark dark:bg-surface-dark"
      style={{ viewTransitionName: 'dialog' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Ariakit.PopoverHeading className="text-base font-semibold tracking-tight">Edit event</Ariakit.PopoverHeading>
          <Ariakit.PopoverDescription className="text-muted mt-0.5 text-sm">
            {formatDay(event.day)}
            {event.allDay ? ' · All day' : ` · ${event.start}`}
          </Ariakit.PopoverDescription>
        </div>
        <Ariakit.PopoverDismiss
          aria-label="Close"
          className="text-muted -mr-1 rounded-md p-1 transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white"
          disabled={busy}
        >
          <X className="size-4" />
        </Ariakit.PopoverDismiss>
      </div>
      <form action={formAction} className="mt-4 space-y-4">
        <label className="block">
          <span className={fieldLabel}>Title</span>
          <input autoFocus defaultValue={event.title} name="title" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input className="size-4 w-auto" defaultChecked={event.allDay} name="allDay" type="checkbox" />
          All day
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
            <Ariakit.PopoverDismiss
              className="text-muted rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-black disabled:opacity-50 dark:hover:text-white"
              disabled={busy}
            >
              Cancel
            </Ariakit.PopoverDismiss>
            <button
              className="rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
              disabled={busy}
              type="submit"
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </Ariakit.Popover>
  )
}
