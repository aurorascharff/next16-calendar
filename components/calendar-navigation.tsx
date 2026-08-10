'use client';

import { CalendarDays, Link2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useOptimistic, useTransition } from 'react';
import { FlowMark } from '@/components/ui/flow-mark';
import { IconButton } from '@/components/ui/icon-button';
import { NavLink } from '@/components/ui/nav-link';
import { useTodayKey } from '@/features/calendar/hooks/use-now';
import type { Route } from 'next';
import type { ComponentProps } from 'react';

const sidebarLink =
  'flex min-h-10 w-10 max-w-full items-center justify-center gap-3 rounded-xl px-0 text-sm font-medium text-muted transition-colors lg:w-52 lg:justify-start lg:px-3 not-aria-[current=page]:hover:bg-card not-aria-[current=page]:hover:text-black dark:not-aria-[current=page]:hover:bg-card-dark dark:not-aria-[current=page]:hover:text-white aria-[current=page]:bg-accent-fade aria-[current=page]:font-semibold aria-[current=page]:text-accent aria-[current=page]:[&_svg]:stroke-[2.5]';
const REPO_URL = 'https://github.com/aurorascharff/next16-calendar';

type CalendarLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & { href?: Route };
type CalendarNavLinkProps = Omit<ComponentProps<typeof NavLink>, 'href' | 'match'> & { href?: Route };

export function CalendarSidebarBrand({ expanded = false }: { expanded?: boolean }) {
  return (
    <div
      className={`mb-6 flex items-center gap-2 ${expanded ? 'flex-row justify-between px-2' : 'flex-col px-0 lg:flex-row lg:justify-between lg:px-2'}`}
    >
      <CalendarHomeLink aria-label="Flow home" className="flex min-w-0 items-center gap-2.5">
        <FlowMark className="size-8 shrink-0" />
        <span className={expanded ? 'min-w-0' : 'hidden min-w-0 lg:block'}>
          <span className="block truncate font-semibold tracking-tight">Flow</span>
          <span className="text-muted block truncate text-xs">Shape your day</span>
        </span>
      </CalendarHomeLink>
      <IconButton
        className={expanded ? 'mr-8' : 'hidden lg:inline-flex'}
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

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function useCalendarHomeHref() {
  const today = useTodayKey();
  return (today ? `/calendar/${today}` : '/') as Route;
}

function CalendarHomeLink(props: CalendarLinkProps) {
  return (
    <Suspense fallback={<CalendarHomeLinkView {...props} />}>
      <CalendarHomeLinkInner {...props} />
    </Suspense>
  );
}

function CalendarHomeLinkInner({ href, ...props }: CalendarLinkProps) {
  const homeHref = useCalendarHomeHref();
  return <CalendarHomeLinkView href={href ?? homeHref} {...props} />;
}

function CalendarHomeLinkView({ href = '/', ...props }: CalendarLinkProps) {
  return <Link href={href} {...props} />;
}

function CalendarHomeNavLink(props: CalendarNavLinkProps) {
  return (
    <Suspense fallback={<CalendarHomeNavLinkView {...props} />}>
      <CalendarHomeNavLinkInner {...props} />
    </Suspense>
  );
}

function CalendarHomeNavLinkInner({ href, ...props }: CalendarNavLinkProps) {
  const homeHref = useCalendarHomeHref();
  return <CalendarHomeNavLinkView href={href ?? homeHref} {...props} />;
}

function CalendarHomeNavLinkView({ href = '/', ...props }: CalendarNavLinkProps) {
  return <NavLink href={href} match="/calendar" {...props} />;
}

export function WorkspaceNavigationLinks({ expanded = false }: { expanded?: boolean }) {
  return (
    <Suspense fallback={<WorkspaceNavigationLinksView expanded={expanded} />}>
      <WorkspaceNavigationLinksInner expanded={expanded} />
    </Suspense>
  );
}

function WorkspaceNavigationLinksInner({ expanded }: { expanded: boolean }) {
  const pathname = usePathname();
  const current: 'booking' | 'calendar' = pathname.startsWith('/booking') ? 'booking' : 'calendar';
  const [active, setActive] = useOptimistic(current);
  const [, startTransition] = useTransition();

  function navigate(next: 'booking' | 'calendar') {
    if (next === active) return;
    startTransition(() => setActive(next));
  }

  return <WorkspaceNavigationLinksView active={active} expanded={expanded} onNavigate={navigate} />;
}

function WorkspaceNavigationLinksView({
  active,
  expanded = false,
  onNavigate,
}: {
  active?: 'booking' | 'calendar';
  expanded?: boolean;
  onNavigate?: (next: 'booking' | 'calendar') => void;
} = {}) {
  const linkClass = expanded ? `${sidebarLink} w-full justify-start px-3` : sidebarLink;
  return (
    <nav className="flex flex-col gap-1">
      <CalendarHomeNavLink
        active={active === undefined ? undefined : active === 'calendar'}
        aria-label="Calendar"
        className={linkClass}
        onNavigate={() => onNavigate?.('calendar')}
      >
        <CalendarDays className="size-4" />
        <span className={expanded ? undefined : 'hidden lg:inline'}>Calendar</span>
      </CalendarHomeNavLink>
      <NavLink
        active={active === undefined ? undefined : active === 'booking'}
        aria-label="Booking link"
        href="/booking"
        className={linkClass}
        onNavigate={() => onNavigate?.('booking')}
      >
        <Link2 className="size-4" />
        <span className={expanded ? undefined : 'hidden lg:inline'}>Booking link</span>
      </NavLink>
    </nav>
  );
}
