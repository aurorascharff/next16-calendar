import { CalendarDays, Link2, Settings } from 'lucide-react'
import Link from 'next/link'
import { ViewTransition } from 'react'

const mainLink =
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white'

export function CalendarNavigation() {
  return (
    <ViewTransition name="sidebar" default="none">
      <aside className="border-divider hidden h-dvh w-64 shrink-0 flex-col border-r bg-surface p-3 dark:border-divider-dark dark:bg-surface-dark md:flex">
        <Link href="/calendar/2026-08-10" className="mb-7 flex items-center gap-3 px-2">
          <div className="grid size-8 place-items-center rounded-md bg-primary text-sm font-bold text-white">D</div>
          <div>
            <p className="font-semibold tracking-tight">Pace</p>
            <p className="text-muted text-xs">Calendar workspace</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-1">
          <Link className={mainLink} href="/calendar/2026-08-10">
            <CalendarDays className="size-4" />
            Calendar
          </Link>
          <Link className={mainLink} href="/booking">
            <Link2 className="size-4" />
            Booking links
          </Link>
        </nav>

        <div className="mt-8">
          <p className="text-muted px-3 text-xs font-semibold tracking-wide uppercase">Calendars</p>
          <div className="mt-3 space-y-1 px-3 text-sm">
            <CalendarLabel color="bg-blue-400" label="Aurora" />
            <CalendarLabel color="bg-violet-400" label="Focus" />
            <CalendarLabel color="bg-amber-400" label="Team" />
          </div>
        </div>

        <div className="mt-auto border-t border-divider pt-3 dark:border-divider-dark">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="grid size-8 place-items-center rounded-full bg-blue-400/20 text-sm font-semibold text-blue-300">A</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Aurora</p>
              <p className="text-muted text-xs">Personal workspace</p>
            </div>
            <Settings className="text-muted size-4" />
          </div>
        </div>
      </aside>
    </ViewTransition>
  )
}

function CalendarLabel({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-muted">
      <span className={`size-2 rounded-full ${color}`} />
      {label}
    </div>
  )
}

export function MobileCalendarNavigation() {
  return (
    <ViewTransition name="mobile-nav" default="none">
      <nav className="border-divider fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t bg-surface px-4 pb-[env(safe-area-inset-bottom)] md:hidden dark:border-divider-dark dark:bg-surface-dark">
        <Link className="flex flex-col items-center gap-1 text-xs font-medium text-muted hover:text-white" href="/calendar/2026-08-10">
          <CalendarDays className="size-5" />
          Calendar
        </Link>
        <Link className="flex flex-col items-center gap-1 text-xs font-medium text-muted hover:text-white" href="/booking">
          <Link2 className="size-5" />
          Booking
        </Link>
      </nav>
    </ViewTransition>
  )
}
