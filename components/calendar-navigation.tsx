'use client';

import { CalendarDays, Link2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Suspense, useOptimistic, useTransition } from 'react';
import { FlowMark } from '@/components/ui/flow-mark';
import { GitHubIcon } from '@/components/ui/github-icon';
import { IconButton } from '@/components/ui/icon-button';
import { NavLink } from '@/components/ui/nav-link';
import { CalendarHomeLink, CalendarHomeNavLink } from '@/features/calendar/components/calendar-home-link';

const sidebarLink =
  'flex min-h-10 w-10 max-w-full items-center justify-center gap-3 rounded-xl px-0 text-sm font-medium text-muted transition-colors min-[110rem]:w-52 min-[110rem]:justify-start min-[110rem]:px-3 not-aria-[current=page]:hover:bg-card not-aria-[current=page]:hover:text-black dark:not-aria-[current=page]:hover:bg-card-dark dark:not-aria-[current=page]:hover:text-white aria-[current=page]:bg-accent-fade aria-[current=page]:font-semibold aria-[current=page]:text-accent aria-[current=page]:[&_svg]:stroke-[2.5]';
const REPO_URL = 'https://github.com/aurorascharff/next16-calendar';

export function CalendarSidebarBrand() {
  return (
    <div className="mb-6 flex flex-col items-center gap-2 px-0 min-[110rem]:flex-row min-[110rem]:justify-between min-[110rem]:px-2">
      <CalendarHomeLink aria-label="Flow home" className="flex min-w-0 items-center gap-2.5">
        <FlowMark className="size-8 shrink-0" />
        <span className="hidden min-w-0 min-[110rem]:block">
          <span className="block truncate font-semibold tracking-tight">Flow</span>
          <span className="text-muted block truncate text-xs">Shape your day</span>
        </span>
      </CalendarHomeLink>
      <IconButton
        className="hidden min-[110rem]:inline-flex"
        external
        href={REPO_URL}
        label="View source on GitHub"
        size="sm"
      >
        <GitHubIcon className="size-4" />
      </IconButton>
    </div>
  );
}

export function WorkspaceNavigationLinks() {
  return (
    <Suspense fallback={<WorkspaceNavigationLinksView />}>
      <WorkspaceNavigationLinksInner />
    </Suspense>
  );
}

function WorkspaceNavigationLinksInner() {
  const pathname = usePathname();
  const current: 'booking' | 'calendar' = pathname.startsWith('/booking') ? 'booking' : 'calendar';
  const [active, setActive] = useOptimistic(current);
  const [, startTransition] = useTransition();

  function navigate(next: 'booking' | 'calendar') {
    if (next === active) return;
    startTransition(() => setActive(next));
  }

  return <WorkspaceNavigationLinksView active={active} onNavigate={navigate} />;
}

function WorkspaceNavigationLinksView({
  active,
  onNavigate,
}: {
  active?: 'booking' | 'calendar';
  onNavigate?: (next: 'booking' | 'calendar') => void;
} = {}) {
  return (
    <nav className="flex flex-col gap-1">
      <CalendarHomeNavLink
        active={active === undefined ? undefined : active === 'calendar'}
        aria-label="Calendar"
        className={sidebarLink}
        onNavigate={() => onNavigate?.('calendar')}
      >
        <CalendarDays className="size-4" />
        <span className="hidden min-[110rem]:inline">Calendar</span>
      </CalendarHomeNavLink>
      <NavLink
        active={active === undefined ? undefined : active === 'booking'}
        aria-label="Booking link"
        href="/booking"
        className={sidebarLink}
        onNavigate={() => onNavigate?.('booking')}
      >
        <Link2 className="size-4" />
        <span className="hidden min-[110rem]:inline">Booking link</span>
      </NavLink>
    </nav>
  );
}
