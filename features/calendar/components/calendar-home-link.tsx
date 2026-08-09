'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { NavLink } from '@/components/ui/nav-link';
import { useTodayKey } from '../hooks/use-now';
import type { Route } from 'next';
import type { ComponentProps } from 'react';

type CalendarLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href?: Route;
};

type CalendarNavLinkProps = Omit<ComponentProps<typeof NavLink>, 'href' | 'match'> & {
  href?: Route;
};

function useCalendarHomeLink() {
  const today = useTodayKey();
  return (today ? `/calendar/${today}` : '/') as Route;
}

export function CalendarHomeLink(props: CalendarLinkProps) {
  return (
    <Suspense fallback={<CalendarHomeLinkShell {...props} />}>
      <CalendarHomeLinkInner {...props} />
    </Suspense>
  );
}

function CalendarHomeLinkInner({ href, ...props }: CalendarLinkProps) {
  const homeHref = useCalendarHomeLink();

  return <Link href={href ?? homeHref} {...props} />;
}

function CalendarHomeLinkShell({ href, ...props }: CalendarLinkProps) {
  return <Link href={href ?? '/'} {...props} />;
}

export function CalendarHomeNavLink(props: CalendarNavLinkProps) {
  return (
    <Suspense fallback={<CalendarHomeNavLinkShell {...props} />}>
      <CalendarHomeNavLinkInner {...props} />
    </Suspense>
  );
}

function CalendarHomeNavLinkInner({ href, ...props }: CalendarNavLinkProps) {
  const homeHref = useCalendarHomeLink();

  return <NavLink href={href ?? homeHref} match="/calendar" {...props} />;
}

function CalendarHomeNavLinkShell({ href, ...props }: CalendarNavLinkProps) {
  return <NavLink href={href ?? '/'} match="/calendar" {...props} />;
}
