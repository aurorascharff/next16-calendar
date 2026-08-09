'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

function getCalendarDate(pathname: string | null) {
  return pathname?.match(/^\/calendar\/(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
}

function getTransitionTypes(
  pathname: string | null,
  today: string | null,
): ComponentProps<typeof Link>['transitionTypes'] {
  const current = getCalendarDate(pathname);

  if (!current || !today || current === today) {
    return undefined;
  }

  return [today < current ? 'nav-back' : 'nav-forward'];
}

function useCalendarHomeLink() {
  const pathname = usePathname();
  const today = useTodayKey();
  const href = (today ? `/calendar/${today}` : '/') as Route;

  return {
    href,
    transitionTypes: getTransitionTypes(pathname, today),
  };
}

export function CalendarHomeLink({ href, ...props }: CalendarLinkProps) {
  const home = useCalendarHomeLink();

  return (
    <Link
      href={href ?? home.href}
      transitionTypes={home.transitionTypes}
      {...props}
    />
  );
}

export function CalendarHomeNavLink({ href, ...props }: CalendarNavLinkProps) {
  const home = useCalendarHomeLink();

  return (
    <NavLink
      href={href ?? home.href}
      match="/calendar"
      transitionTypes={home.transitionTypes}
      {...props}
    />
  );
}
