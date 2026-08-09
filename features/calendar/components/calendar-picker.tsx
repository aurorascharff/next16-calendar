'use client'

import type { Calendar } from '../types/calendar'

export function CalendarPicker({
  calendars,
  defaultValue,
  name,
}: {
  calendars: Calendar[]
  defaultValue?: string
  name: string
}) {
  return (
    <select defaultValue={defaultValue ?? calendars[0]?.id} name={name}>
      {calendars.map((calendar) => (
        <option disabled={calendar.isDemo} key={calendar.id} value={calendar.id}>
          {calendar.name}
          {calendar.isDemo ? ' (demo)' : ''}
        </option>
      ))}
    </select>
  )
}
