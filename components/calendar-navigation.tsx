import { CalendarDays, Link2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Suspense, ViewTransition } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Crossfade } from '@/components/ui/crossfade';
import { GitHubIcon } from '@/components/ui/github-icon';
import { NavLink } from '@/components/ui/nav-link';
import { getCalendars } from '@/features/calendar/calendar-queries';
import { CalendarManager } from '@/features/calendar/components/calendar-manager';
import { MiniMonth } from '@/features/calendar/components/mini-month';
import { signOut } from '@/features/user/user-actions';
import { getCurrentUser } from '@/features/user/user-queries';

const REPO_URL = 'https://github.com/aurorascharff/next16-calendar';

const sidebarLink =
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted not-aria-[current=page]:hover:bg-card not-aria-[current=page]:hover:text-black dark:not-aria-[current=page]:hover:bg-card-dark dark:not-aria-[current=page]:hover:text-white aria-[current=page]:bg-accent/10 aria-[current=page]:font-semibold aria-[current=page]:text-accent aria-[current=page]:[&_svg]:stroke-[2.5]';

export function CalendarNavigation() {
  return (
    <ViewTransition name="sidebar" default="none">
      <aside className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark hidden h-dvh w-64 shrink-0 flex-col border-r p-3 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-2">
          <span className="bg-accent grid size-8 place-items-center rounded-md text-white">
            <CalendarDays className="size-4.5" strokeWidth={2.25} />
          </span>
          <span>
            <span className="block font-semibold tracking-tight">Cadence</span>
            <span className="text-muted block text-xs">Calendar workspace</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          <NavLink href="/" match="/calendar" className={sidebarLink}>
            <CalendarDays className="size-4" />
            Calendar
          </NavLink>
          <NavLink href="/booking" className={sidebarLink}>
            <Link2 className="size-4" />
            Booking link
          </NavLink>
        </nav>

        <div className="mt-6 px-1">
          <MiniMonth />
        </div>

        <div className="mt-6">
          <Suspense fallback={<CalendarsFallback />}>
            <CalendarSection />
          </Suspense>
        </div>

        <div className="mt-auto">
          <div className="mb-3 flex items-center justify-between px-1">
            <ThemeToggle />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
              className="text-muted rounded-md p-1.5 hover:text-black dark:hover:text-white"
            >
              <GitHubIcon className="size-4" />
            </a>
          </div>
          <div className="border-divider dark:border-divider-dark -mx-3 -mb-3 border-t">
            <Suspense fallback={<div className="h-[60px]" />}>
              <UserFooter />
            </Suspense>
          </div>
        </div>
      </aside>
    </ViewTransition>
  );
}

async function UserFooter() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <div className="flex items-center gap-2.5 px-3 py-3">
      <span className="bg-accent grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white uppercase">
        {user.name.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="text-muted truncate text-xs">@{user.handle}</p>
      </div>
      <form action={signOut}>
        <button
          aria-label="Log out"
          className="text-muted hover:bg-card dark:hover:bg-card-dark rounded-md p-1.5 hover:text-black dark:hover:text-white"
          type="submit"
        >
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}

async function CalendarSection() {
  const calendars = await getCalendars();
  return (
    <Crossfade>
      <CalendarManager calendars={calendars} />
    </Crossfade>
  );
}

function CalendarsFallback() {
  return <p className="text-muted mb-2 px-3 text-xs font-semibold tracking-wide uppercase">Calendars</p>;
}

const mobileTab =
  'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted hover:text-black dark:hover:text-white aria-[current=page]:font-semibold aria-[current=page]:text-accent aria-[current=page]:[&_svg]:stroke-[2.5]';

export function MobileCalendarNavigation() {
  return (
    <ViewTransition name="mobile-nav" default="none">
      <nav
        aria-label="Primary"
        className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark fixed inset-x-0 bottom-0 z-30 flex border-t pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <NavLink href="/" match="/calendar" className={mobileTab}>
          <CalendarDays className="size-5" />
          Calendar
        </NavLink>
        <NavLink href="/booking" className={mobileTab}>
          <Link2 className="size-5" />
          Booking
        </NavLink>
      </nav>
    </ViewTransition>
  );
}
