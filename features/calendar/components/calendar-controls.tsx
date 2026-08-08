'use client'

import { ChevronLeft, ChevronRight, Today } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition, ViewTransition } from 'react'
import { shiftWeek } from '../calendar-utils'

export function CalendarControls({ date }: { date: string }) {
  const router = useRouter()
  const previous = shiftWeek(date, -1)
  const next = shiftWeek(date, 1)

  function goTo(value: string) {
    startTransition(() => {
      router.push(`/calendar/${value}`)
    })
  }

  return (
    <ViewTransition default="none" name="calendar-controls">
      <div className="flex h-9 items-center rounded-md border border-divider bg-surface p-0.5 dark:border-divider-dark dark:bg-surface-dark">
        <Link
          aria-label="Previous week"
          className="flex size-8 items-center justify-center rounded text-muted hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white"
          href={`/calendar/${previous}`}
          prefetch
          transitionTypes={['calendar-back']}
        >
          <ChevronLeft className="size-4" />
        </Link>
        <button
          className="flex h-8 items-center gap-1.5 rounded px-2 text-sm font-medium hover:bg-card dark:hover:bg-card-dark"
          onClick={() => goTo(new Date().toISOString().slice(0, 10))}
          type="button"
        >
          <Today className="size-3.5" />
          Today
        </button>
        <input
          aria-label="Jump to date"
          className="h-8 w-32 rounded bg-transparent px-1.5 text-sm outline-none [color-scheme:light] dark:[color-scheme:dark]"
          defaultValue={date}
          onChange={(event) => goTo(event.target.value)}
          type="date"
        />
        <Link
          aria-label="Next week"
          className="flex size-8 items-center justify-center rounded text-muted hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white"
          href={`/calendar/${next}`}
          prefetch
          transitionTypes={['calendar-forward']}
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </ViewTransition>
  )
}
