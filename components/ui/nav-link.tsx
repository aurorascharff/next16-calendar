'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import type { Route } from 'next'

type RenderProps = { isActive: boolean }
type Renderable<T> = T | ((props: RenderProps) => T)

type Props<T extends string = string> = Omit<
  React.ComponentProps<typeof Link>,
  'href' | 'className' | 'children'
> & {
  href: Route<T> | URL
  // Prefix used to decide active state, independent of `href`. Calendar links
  // point at a specific date (`/calendar/2026-08-10`) but should stay active on
  // any date, so we match on `/calendar` instead of the exact href.
  match?: string
  exact?: boolean
  className?: Renderable<string | undefined>
  children?: Renderable<React.ReactNode>
}

function resolve<T>(value: Renderable<T> | undefined, props: RenderProps): T | undefined {
  return typeof value === 'function' ? (value as (p: RenderProps) => T)(props) : value
}

function checkActive(pathname: string, target: string, exact?: boolean): boolean {
  if (exact || target === '/') return pathname === target
  return pathname === target || pathname.startsWith(`${target}/`)
}

// `<Link>` that reflects the current route with `aria-current="page"`, so active
// styles are pure CSS (`aria-[current=page]:...`). `usePathname` is dynamic under
// Cache Components, so the read lives behind <Suspense>; the fallback renders the
// same shell inactive, keeping layout stable with no swap or flash.
export function NavLink<T extends string>(props: Props<T>) {
  return (
    <Suspense fallback={<NavLinkShell {...props} isActive={false} />}>
      <NavLinkInner {...props} />
    </Suspense>
  )
}

function NavLinkInner<T extends string>(props: Props<T>) {
  const pathname = usePathname()
  const target = (props.match ?? props.href.toString()).split('?')[0].split('#')[0]
  const isActive = checkActive(pathname, target, props.exact)
  return <NavLinkShell {...props} isActive={isActive} />
}

function NavLinkShell<T extends string>({
  href,
  match: _match,
  exact: _exact,
  className,
  children,
  isActive,
  ...rest
}: Props<T> & { isActive: boolean }) {
  return (
    <Link
      href={href as Route}
      aria-current={isActive ? 'page' : undefined}
      className={resolve(className, { isActive })}
      suppressHydrationWarning
      {...rest}
    >
      {resolve(children, { isActive })}
    </Link>
  )
}
