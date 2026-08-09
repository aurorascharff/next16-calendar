'use client'

import { useActionState } from 'react'
import { toast } from 'sonner'
import { updateBookingAvailability } from '../booking-actions'

type Settings = {
  active: boolean
  duration: number
  endTime: string
  handle: string
  startTime: string
  title: string
}

type State = { error?: string }

const fieldLabel = 'text-muted mb-1.5 block text-xs font-medium'

export function BookingSettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, isPending] = useActionState(async (_prev: State, formData: FormData): Promise<State> => {
    const result = await updateBookingAvailability({
      active: formData.get('active') === 'on',
      duration: Number(formData.get('duration')),
      endTime: String(formData.get('endTime')),
      startTime: String(formData.get('startTime')),
      title: String(formData.get('title')),
    })

    if (result.error) return { error: result.error }
    toast.success('Availability updated.')
    return {}
  }, {})

  return (
    <form action={formAction} className="border-divider rounded-lg border bg-card/40 p-5 dark:border-divider-dark dark:bg-card-dark/30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Availability settings</h2>
          <p className="text-muted mt-1 text-sm">Control the shared booking link for @{settings.handle}.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input className="size-4 w-auto" defaultChecked={settings.active} name="active" type="checkbox" />
          Active
        </label>
      </div>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className={fieldLabel}>Title</span>
          <input defaultValue={settings.title} name="title" />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <span className={fieldLabel}>Start</span>
            <input defaultValue={settings.startTime} name="startTime" type="time" />
          </label>
          <label className="block">
            <span className={fieldLabel}>End</span>
            <input defaultValue={settings.endTime} name="endTime" type="time" />
          </label>
          <label className="block">
            <span className={fieldLabel}>Duration</span>
            <select defaultValue={String(settings.duration)} name="duration">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </label>
        </div>
      </div>
      {state.error ? <p className="text-danger mt-4 text-sm">{state.error}</p> : null}
      <div className="mt-5 flex justify-end">
        <button
          className="rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </form>
  )
}
