'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { Boundary } from '@/components/internal/boundary';
import type { Route } from 'next';

type RenderProps = { isActive: boolean };
type Renderable<T> = T | ((props: RenderProps) => T);

type Props<T extends string = string> = Omit<React.ComponentProps<typeof Link>, 'href' | 'className' | 'children'> & {
  href: Route<T> | URL;
  match?: string;
  exact?: boolean;
  active?: boolean;
  className?: Renderable<string | undefined>;
  children?: Renderable<React.ReactNode>;
};

function resolve<T>(value: Renderable<T> | undefined, props: RenderProps): T | undefined {
  return typeof value === 'function' ? (value as (p: RenderProps) => T)(props) : value;
}

function checkActive(pathname: string, target: string, exact?: boolean): boolean {
  if (exact || target === '/') return pathname === target;
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function NavLink<T extends string>(props: Props<T>) {
  return (
    <Boundary label="NavLink">
      <Suspense fallback={<NavLinkShell {...props} isActive={props.active ?? false} />}>
        <NavLinkInner {...props} />
      </Suspense>
    </Boundary>
  );
}

function NavLinkInner<T extends string>(props: Props<T>) {
  const pathname = usePathname();
  const target = (props.match ?? props.href.toString()).split('?')[0].split('#')[0];
  const isActive = props.active ?? checkActive(pathname, target, props.exact);
  return <NavLinkShell {...props} isActive={isActive} />;
}

function NavLinkShell<T extends string>({
  href,
  match,
  exact,
  active,
  className,
  children,
  isActive,
  ...rest
}: Props<T> & { isActive: boolean }) {
  const target = (match ?? href.toString()).split('?')[0].split('#')[0];

  return (
    <Link
      href={href as Route}
      aria-current={isActive ? 'page' : undefined}
      className={resolve(className, { isActive })}
      data-navlink-exact={exact || undefined}
      data-navlink-href={target}
      suppressHydrationWarning
      {...rest}
    >
      {resolve(children, { isActive })}
    </Link>
  );
}
