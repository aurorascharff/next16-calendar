import { Suspense, ViewTransition } from 'react';
import { CalendarSidebarBrand, WorkspaceNavigationLinks } from '@/components/calendar-navigation';
import { MobileCalendarSidebar } from '@/components/mobile-calendar-sidebar';
import { Crossfade } from '@/components/ui/crossfade';
import ErrorBoundary from '@/components/ui/error-boundary';
import { CalendarList } from '@/features/calendar/components/calendar-list';
import { CalendarManagerSkeleton, NewCalendarButton } from '@/features/calendar/components/calendar-manager';
import { CalendarVisibilityProvider } from '@/features/calendar/components/calendar-visibility';
import { MiniMonth, MiniMonthSkeleton } from '@/features/calendar/components/mini-month';
import { CurrentUserFooter } from '@/features/user/components/current-user-footer';
import type { ReactNode } from 'react';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <CalendarVisibilityProvider>
      <div className="bg-surface dark:bg-surface-dark flex min-h-svh md:h-dvh md:min-h-0">
        <ViewTransition name="sidebar" default="none">
          <aside className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark hidden h-dvh w-[4.5rem] shrink-0 flex-col items-center border-r p-3 md:flex lg:w-64 lg:items-stretch">
            <CalendarSidebarContent />
          </aside>
        </ViewTransition>
        <MobileCalendarSidebar>
          <CalendarSidebarContent expanded />
        </MobileCalendarSidebar>
        {children}
      </div>
    </CalendarVisibilityProvider>
  );
}

function CalendarSidebarContent({ expanded = false }: { expanded?: boolean }) {
  return (
    <>
      <CalendarSidebarBrand expanded={expanded} />
      <WorkspaceNavigationLinks expanded={expanded} />
      <div className={expanded ? 'mt-6 px-1' : 'mt-6 hidden px-1 lg:block'}>
        <ErrorBoundary compact title="Mini calendar unavailable">
          <Suspense fallback={<MiniMonthSkeleton />}>
            <MiniMonth />
          </Suspense>
        </ErrorBoundary>
      </div>
      <div className="mt-6 flex min-h-0 w-full flex-1 flex-col">
        <div
          className={
            expanded
              ? 'mb-2 flex items-center justify-between px-3'
              : 'mb-2 flex items-center justify-center px-0 lg:justify-between lg:px-3'
          }
        >
          <p
            className={
              expanded
                ? 'text-muted text-xs font-semibold tracking-wide uppercase'
                : 'text-muted hidden text-xs font-semibold tracking-wide uppercase lg:block'
            }
          >
            Calendars
          </p>
          <NewCalendarButton />
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="h-full [scrollbar-gutter:stable] overflow-y-auto overscroll-contain pb-6">
            <ErrorBoundary compact title="Calendars unavailable">
              <Suspense fallback={<CalendarManagerSkeleton expanded={expanded} />}>
                <Crossfade>
                  <CalendarList expanded={expanded} />
                </Crossfade>
              </Suspense>
            </ErrorBoundary>
          </div>
          <div
            aria-hidden
            className="from-surface dark:from-surface-dark pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t to-transparent"
          />
        </div>
      </div>
      <div className="mt-2">
        <div className="border-divider dark:border-divider-dark -mx-3 -mb-3 border-t">
          <Suspense fallback={<div className={expanded ? 'h-[60px]' : 'h-[92px] lg:h-[60px]'} />}>
            <CurrentUserFooter expanded={expanded} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
