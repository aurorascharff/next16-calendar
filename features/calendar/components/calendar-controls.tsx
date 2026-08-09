'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition } from 'react'
import { dateKey, shiftWeek } from '../calendar-utils'
import { DatePicker } from './date-picker'

const iconButton =
  'flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white'

export function CalendarControls({ date }: { date: string }) {
  const router = useRouter()
  const previous = shiftWeek(date, -1)
  const next = shiftWeek(date, 1)

  function goToday() {
    startTransition(() => router.push(`/calendar/${dateKey(new Date())}`))
  }

  return (
    <div className="flex items-center gap-1">
      <button
        className="text-muted h-8 rounded-md px-3 text-sm font-medium transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white"
        onClick={goToday}
        type="button"
      >
        Today
      </button>
      <div className="flex items-center">
        <Link aria-label="Previous week" className={iconButton} href={`/calendar/${previous}`} prefetch transitionTypes={['calendar-back']}>
          <ChevronLeft className="size-4.5" />
        </Link>
        <Link aria-label="Next week" className={iconButton} href={`/calendar/${next}`} prefetch transitionTypes={['calendar-forward']}>
          <ChevronRight className="size-4.5" />
        </Link>
      </div>
      <DatePicker date={date} />
    </div>
  )
}
