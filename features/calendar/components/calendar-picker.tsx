'use client'

import * as Ariakit from '@ariakit/react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dotClass } from '../utils/colors'
import type { Calendar } from '../types/calendar'

export function CalendarPicker({ calendars, defaultValue, name }: { calendars: Calendar[]; defaultValue?: string; name: string }) {
  const store = Ariakit.useSelectStore({ defaultValue: defaultValue ?? calendars[0]?.id })
  const value = Ariakit.useStoreState(store, 'value')
  const selected = calendars.find((calendar) => calendar.id === value) ?? calendars[0]

  return (
    <Ariakit.SelectProvider store={store}>
      <input name={name} type="hidden" value={value} />
      <Ariakit.Select className="border-divider dark:border-divider-dark flex w-full items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-sm transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none dark:bg-[#1c1c1c]">
        <span className="flex min-w-0 items-center gap-2">
          {selected ? <span className={cn('size-2.5 shrink-0 rounded-full', dotClass[selected.color])} /> : null}
          <span className="truncate">{selected?.name ?? 'Select'}</span>
        </span>
        <ChevronDown className="text-muted size-4 shrink-0" />
      </Ariakit.Select>
      <Ariakit.SelectPopover
        gutter={4}
        sameWidth
        className="border-divider z-50 rounded-md border bg-surface p-1 shadow-lg outline-none dark:border-divider-dark dark:bg-surface-dark"
      >
        {calendars.map((calendar) => (
          <Ariakit.SelectItem
            className="flex items-center gap-2 rounded px-2 py-1.5 text-sm data-[active-item]:bg-card dark:data-[active-item]:bg-card-dark"
            key={calendar.id}
            value={calendar.id}
          >
            <span className={cn('size-2.5 shrink-0 rounded-full', dotClass[calendar.color])} />
            <span className="truncate">{calendar.name}</span>
            {calendar.id === value ? <Check className="text-muted ml-auto size-3.5" /> : null}
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  )
}
