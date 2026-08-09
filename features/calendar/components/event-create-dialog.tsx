'use client'

import * as Ariakit from '@ariakit/react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/dialog'
import { createEvent } from '../calendar-actions'
import type { CalendarName, EventColor } from '../types/calendar'
import { formatDay } from '../calendar-utils'

const fieldLabel = 'text-muted mb-1.5 block text-xs font-medium'

// Calendar drives the color, matching the sidebar legend and the grid.
const calendarColor: Record<CalendarName, EventColor> = {
  focus: 'violet',
  personal: 'rose',
  team: 'blue',
}

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const weekdayLabel = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long' })

export function EventCreateDialog({
  store,
  day,
  defaultStart = '10:00',
  defaultDuration = 60,
}: {
  store: Ariakit.DialogStore
  day: string
  defaultStart?: string
  defaultDuration?: number
}) {
  const [isPending, startTransition] = useTransition()
  const weekday = WEEKDAY_NAMES[new Date(`${day}T00:00:00.000Z`).getUTCDay()]

  function submit(formData: FormData) {
    const calendar = String(formData.get('calendar')) as CalendarName
    const repeat = String(formData.get('repeat'))
    const recurrence = repeat === 'weekday' ? 'weekday' : repeat === 'weekly' ? weekday : null
    startTransition(async () => {
      const result = await createEvent({
        calendar,
        color: calendarColor[calendar],
        day,
        duration: Number(formData.get('duration')),
        recurrence,
        start: String(formData.get('start')),
        title: String(formData.get('title')),
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      store.hide()
      toast.success('Event added to your calendar.')
    })
  }

  return (
    <Dialog store={store} title="New event" description={formatDay(day)} busy={isPending}>
      <form action={submit} className="mt-4 space-y-4">
        <label className="block">
          <span className={fieldLabel}>Title</span>
          <input autoFocus name="title" placeholder="What's happening?" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={fieldLabel}>Starts at</span>
            <input defaultValue={defaultStart} name="start" type="time" />
          </label>
          <label className="block">
            <span className={fieldLabel}>Duration</span>
            <select defaultValue={String(defaultDuration)} name="duration">
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">90 minutes</option>
              <option value="120">2 hours</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={fieldLabel}>Calendar</span>
            <select defaultValue="personal" name="calendar">
              <option value="focus">Focus</option>
              <option value="team">Team</option>
              <option value="personal">Personal</option>
            </select>
          </label>
          <label className="block">
            <span className={fieldLabel}>Repeat</span>
            <select defaultValue="" name="repeat">
              <option value="">Does not repeat</option>
              <option value="weekly">Weekly on {weekdayLabel.format(new Date(`${day}T00:00:00.000Z`))}</option>
              <option value="weekday">Every weekday</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
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
            {isPending ? 'Saving…' : 'Create event'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
