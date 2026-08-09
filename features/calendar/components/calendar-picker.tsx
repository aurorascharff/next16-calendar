'use client';

import * as Ariakit from '@ariakit/react';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { colorStyle } from '../utils/colors';
import type { Calendar } from '../types/calendar';

export function CalendarPicker({
  calendars,
  defaultValue,
  name,
}: {
  calendars: Calendar[];
  defaultValue?: string;
  name: string;
}) {
  const [value, setValue] = useState(defaultValue ?? calendars[0]?.id ?? '');
  const selected = calendars.find(calendar => calendar.id === value) ?? calendars[0];

  return (
    <Ariakit.SelectProvider setValue={setValue} value={value}>
      <input name={name} type="hidden" value={value} />
      <Ariakit.Select className="border-divider focus-visible:border-accent focus-visible:ring-accent/25 dark:border-divider-dark flex w-full items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-black transition-colors focus-visible:ring-2 focus-visible:outline-none dark:bg-[#1c1c1c] dark:text-white">
        {selected ? (
          <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={colorStyle(selected.color)} />
        ) : null}
        <span className="truncate">{selected?.name ?? 'Select calendar'}</span>
        <ChevronDown aria-hidden className="text-muted ml-auto size-4 shrink-0" />
      </Ariakit.Select>
      <Ariakit.SelectPopover
        className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark z-50 max-h-60 overflow-y-auto rounded-md border p-1 shadow-lg outline-none"
        gutter={4}
        sameWidth
      >
        {calendars.map(calendar => (
          <Ariakit.SelectItem
            className="hover:bg-card dark:hover:bg-card-dark data-[active-item]:bg-card dark:data-[active-item]:bg-card-dark flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm"
            key={calendar.id}
            value={calendar.id}
          >
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={colorStyle(calendar.color)} />
            <span className="truncate">{calendar.name}</span>
            {calendar.id === value ? <Check aria-hidden className="text-accent ml-auto size-4 shrink-0" /> : null}
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
