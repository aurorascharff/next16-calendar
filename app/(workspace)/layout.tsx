import { Suspense, ViewTransition } from 'react';
import {
  CalendarList,
  CalendarSidebarBrand,
  CurrentUserFooter,
  MobileWorkspaceNavigation,
  WorkspaceNavigationLinks,
} from '@/components/calendar-navigation';
import { CalendarManagerSkeleton, NewCalendarButton } from '@/features/calendar/components/calendar-manager';
import { CalendarVisibilityProvider } from '@/features/calendar/components/calendar-visibility';
import { MiniMonth } from '@/features/calendar/components/mini-month';
import type { ReactNode } from 'react';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <CalendarVisibilityProvider>
      <div className="bg-surface dark:bg-surface-dark flex min-h-dvh pb-16 md:h-dvh md:pb-0">
        <ViewTransition name="sidebar" default="none">
          <aside className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark hidden h-dvh w-64 shrink-0 flex-col border-r p-3 md:flex">
            <CalendarSidebarBrand />
            <WorkspaceNavigationLinks />

            <div className="relative mt-6 min-h-0 flex-1">
              <div className="h-full [scrollbar-gutter:stable] overflow-y-auto overscroll-contain pb-6">
                <div className="px-1">
                  <MiniMonth />
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between px-3">
                    <p className="text-muted text-xs font-semibold tracking-wide uppercase">Calendars</p>
                    <NewCalendarButton />
                  </div>
                  <Suspense fallback={<CalendarManagerSkeleton />}>
                    <CalendarList />
                  </Suspense>
                </div>
              </div>
              <div
                aria-hidden
                className="from-surface dark:from-surface-dark pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t to-transparent"
              />
            </div>
            <div className="mt-2">
              <div className="border-divider dark:border-divider-dark -mx-3 -mb-3 border-t">
                <Suspense fallback={<div className="h-[60px]" />}>
                  <CurrentUserFooter />
                </Suspense>
              </div>
            </div>
          </aside>
        </ViewTransition>
        {children}
        <MobileWorkspaceNavigation />
      </div>
    </CalendarVisibilityProvider>
  );
}
