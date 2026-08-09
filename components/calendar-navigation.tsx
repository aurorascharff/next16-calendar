import { CalendarDays, Link2 } from 'lucide-react';
import { FlowMark } from '@/components/ui/flow-mark';
import { GitHubIcon } from '@/components/ui/github-icon';
import { IconButton } from '@/components/ui/icon-button';
import { NavLink } from '@/components/ui/nav-link';
import { CalendarHomeLink, CalendarHomeNavLink } from '@/features/calendar/components/calendar-home-link';

const sidebarLink =
  'flex min-h-10 w-52 max-w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition-colors not-aria-[current=page]:hover:bg-card not-aria-[current=page]:hover:text-black dark:not-aria-[current=page]:hover:bg-card-dark dark:not-aria-[current=page]:hover:text-white aria-[current=page]:bg-accent-fade aria-[current=page]:font-semibold aria-[current=page]:text-accent aria-[current=page]:[&_svg]:stroke-[2.5]';
const REPO_URL = 'https://github.com/aurorascharff/next16-calendar';

export function CalendarSidebarBrand() {
  return (
    <div className="mb-6 flex items-center justify-between gap-2 px-2">
      <CalendarHomeLink className="flex min-w-0 items-center gap-2.5">
        <FlowMark className="size-8 shrink-0" />
        <span className="min-w-0">
          <span className="block truncate font-semibold tracking-tight">Flow</span>
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
