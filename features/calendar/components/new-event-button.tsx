'use client'

import * as Ariakit from '@ariakit/react'
import { Plus } from 'lucide-react'
import type { Calendar } from '../types/calendar'
import { EventCreateDialog } from './event-create-dialog'

export function NewEventButton({ calendars, day }: { calendars: Calendar[]; day: string }) {
  const store = Ariakit.useDialogStore()

  return (
    <>
      <Ariakit.DialogDisclosure
        store={store}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">New event</span>
      </Ariakit.DialogDisclosure>
      <EventCreateDialog calendars={calendars} day={day} store={store} />
    </>
  )
}
