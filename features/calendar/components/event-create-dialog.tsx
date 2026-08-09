'use client'

import * as Ariakit from '@ariakit/react'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { createEvent } from '../calendar-actions'
import type { Calendar } from '../types/calendar'
import { formatDay } from '../calendar-utils'
import { CalendarPicker } from './calendar-picker'

const fieldLabel = 'text-muted mb-1.5 block text-xs font-medium'

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const weekdayLabel = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long' })

type State = { error?: string }

export function EventCreateDialog({
  store,
  day,
  calendars,
  defaultAllDay = false,
  defaultCalendarId,
  defaultStart = '10:00',
  defaultDuration = 60,
}: {
  store: Ariakit.PopoverStore
  day: string
  calendars: Calendar[]
  defaultAllDay?: boolean
  defaultCalendarId?: string
  defaultStart?: string
  defaultDuration?: number
}) {
  const weekday = WEEKDAY_NAMES[new Date(`${day}T00:00:00.000Z`).getUTCDay()]
  const writableCalendarId = defaultCalendarId ?? (calendars.find((calendar) => !calendar.isDemo) ?? calendars[0])?.id

  const [state, formAction, isPending] = useActionState(async (_prev: State, formData: FormData): Promise<State> => {
    const repeat = String(formData.get('repeat'))
    const allDay = formData.get('allDay') === 'on'
    const recurrence = repeat === 'weekday' ? 'weekday' : repeat === 'weekly' ? weekday : null
    const result = await createEvent({
      allDay,
      calendarId: String(formData.get('calendarId')),
      day,
      duration: Number(formData.get('duration')),
      recurrence,
      start: String(formData.get('start')),
      title: String(formData.get('title')),
    })
    if (result.error) return { error: result.error }
    store.hide()
    toast.success('Event added to your calendar.')
    return {}
  }, {})

  return (
    <Ariakit.Popover
      store={store}
      unmountOnHide
      fixed
      fitViewport
      gutter={10}
      hideOnEscape={!isPending}
      hideOnInteractOutside={!isPending}
      className="border-divider z-50 w-[min(24rem,calc(100vw-2rem))] rounded-lg border bg-surface p-4 shadow-2xl outline-none dark:border-divider-dark dark:bg-surface-dark"
      style={{ viewTransitionName: 'dialog' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Ariakit.PopoverHeading className="text-base font-semibold tracking-tight">New event</Ariakit.PopoverHeading>
          <Ariakit.PopoverDescription className="text-muted mt-0.5 text-sm">{formatDay(day)}</Ariakit.PopoverDescription>
        </div>
        <Ariakit.PopoverDismiss
          aria-label="Close"
          className="text-muted -mr-1 rounded-md p-1 transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white"
          disabled={isPending}
        >
          ×
        </Ariakit.PopoverDismiss>
      </div>
      <form action={formAction} className="mt-4 space-y-4">
        <label className="block">
          <span className={fieldLabel}>Title</span>
          <input autoFocus name="title" placeholder="What's happening?" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input className="size-4 w-auto" defaultChecked={defaultAllDay} name="allDay" type="checkbox" />
          All day
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
          <div className="block">
            <span className={fieldLabel}>Calendar</span>
            <CalendarPicker calendars={calendars} defaultValue={writableCalendarId} name="calendarId" />
          </div>
          <label className="block">
            <span className={fieldLabel}>Repeat</span>
            <select defaultValue="" name="repeat">
              <option value="">Does not repeat</option>
              <option value="weekly">Weekly on {weekdayLabel.format(new Date(`${day}T00:00:00.000Z`))}</option>
              <option value="weekday">Every weekday</option>
            </select>
          </label>
        </div>
        {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Ariakit.PopoverDismiss
            className="text-muted rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-black disabled:opacity-50 dark:hover:text-white"
            disabled={isPending}
          >
            Cancel
          </Ariakit.PopoverDismiss>
          <button
            className="rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? 'Saving…' : 'Create event'}
          </button>
        </div>
      </form>
    </Ariakit.Popover>
  )
}
