import { CalendarDays, Link2, LogOut } from 'lucide-react';
import { ViewTransition } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Crossfade } from '@/components/ui/crossfade';
import { DaylineMark } from '@/components/ui/dayline-mark';
import { GitHubIcon } from '@/components/ui/github-icon';
import { IconButton } from '@/components/ui/icon-button';
import { NavLink } from '@/components/ui/nav-link';
import { getCalendars } from '@/features/calendar/calendar-queries';
import { CalendarHomeLink, CalendarHomeNavLink } from '@/features/calendar/components/calendar-home-link';
import { CalendarManager } from '@/features/calendar/components/calendar-manager';
import { signOut } from '@/features/user/user-actions';
import { getCurrentUser } from '@/features/user/user-queries';

const sidebarLink =
  'flex min-h-10 w-52 max-w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition-colors not-aria-[current=page]:hover:bg-card not-aria-[current=page]:hover:text-black dark:not-aria-[current=page]:hover:bg-card-dark dark:not-aria-[current=page]:hover:text-white aria-[current=page]:bg-accent-fade aria-[current=page]:font-semibold aria-[current=page]:text-accent aria-[current=page]:[&_svg]:stroke-[2.5]';
const REPO_URL = 'https://github.com/aurorascharff/next16-calendar';

export function CalendarSidebarBrand() {
  return (
    <div className="mb-6 flex items-center justify-between gap-2 px-2">
      <CalendarHomeLink className="flex min-w-0 items-center gap-2.5">
        <DaylineMark className="size-8 shrink-0" />
        <span className="min-w-0">
          <span className="block truncate font-semibold tracking-tight">Dayline</span>
          <span className="text-muted block truncate text-xs">Shape your day</span>
        </span>
      </CalendarHomeLink>
      <IconButton external href={REPO_URL} label="View source on GitHub" size="sm">
        <GitHubIcon className="size-4" />
      </IconButton>
    </div>
  );
}

export function WorkspaceNavigationLinks() {
  return (
    <nav className="flex flex-col gap-1">
      <CalendarHomeNavLink className={sidebarLink}>
        <CalendarDays className="size-4" />
        Calendar
      </CalendarHomeNavLink>
      <NavLink href="/booking" className={sidebarLink}>
        <Link2 className="size-4" />
        Booking link
      </NavLink>
    </nav>
  );
}

export async function CalendarList() {
  const calendars = await getCalendars();
  return (
    <Crossfade>
      <CalendarManager calendars={calendars} />
    </Crossfade>
  );
}

export async function CurrentUserFooter() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex items-center gap-1 px-3 py-3">
      <span className="bg-accent grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white uppercase">
        {user.name.charAt(0)}
      </span>
      <form action={signOut}>
        <IconButton label="Log out" size="sm" type="submit">
          <LogOut className="size-4" />
        </IconButton>
      </form>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </div>
  );
}

const mobileTab =
  'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted not-aria-[current=page]:hover:text-accent aria-[current=page]:font-semibold aria-[current=page]:text-accent aria-[current=page]:[&_svg]:stroke-[2.5]';

export function MobileWorkspaceNavigation() {
  return (
    <ViewTransition name="mobile-nav" default="none">
      <nav
        aria-label="Primary"
        className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark fixed inset-x-0 bottom-0 z-30 flex border-t pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <CalendarHomeNavLink className={mobileTab}>
          <CalendarDays className="size-5" />
          Calendar
        </CalendarHomeNavLink>
        <NavLink href="/booking" className={mobileTab}>
          <Link2 className="size-5" />
          Booking
        </NavLink>
      </nav>
    </ViewTransition>
  );
}
