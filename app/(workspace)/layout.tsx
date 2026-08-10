import { Suspense, ViewTransition } from 'react';
import { CalendarSidebarBrand, WorkspaceNavigationLinks } from '@/components/calendar-navigation';
import { Crossfade } from '@/components/ui/crossfade';
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
          <aside className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark hidden h-dvh w-[4.5rem] shrink-0 flex-col items-center border-r p-3 md:flex min-[110rem]:w-64 min-[110rem]:items-stretch">
            <CalendarSidebarBrand />
            <WorkspaceNavigationLinks />
            <div className="mt-6 hidden px-1 min-[110rem]:block">
              <Suspense fallback={<MiniMonthSkeleton />}>
                <MiniMonth />
              </Suspense>
            </div>
            <div className="mt-6 flex min-h-0 w-full flex-1 flex-col">
              <div className="mb-2 flex items-center justify-center px-0 min-[110rem]:justify-between min-[110rem]:px-3">
                <p className="text-muted hidden text-xs font-semibold tracking-wide uppercase min-[110rem]:block">
                  Calendars
                </p>
                <NewCalendarButton />
              </div>
              <div className="relative min-h-0 flex-1 overflow-hidden">
                <div className="h-full [scrollbar-gutter:stable] overflow-y-auto overscroll-contain pb-6">
                  <Suspense fallback={<CalendarManagerSkeleton />}>
                    <Crossfade>
                      <CalendarList />
                    </Crossfade>
                  </Suspense>
                </div>
                <div
                  aria-hidden
                  className="from-surface dark:from-surface-dark pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t to-transparent"
                />
              </div>
            </div>
            <div className="mt-2">
              <div className="border-divider dark:border-divider-dark -mx-3 -mb-3 border-t min-[110rem]:mx-0 min-[110rem]:-mx-3">
                <Suspense fallback={<div className="h-[60px]" />}>
                  <CurrentUserFooter />
                </Suspense>
              </div>
            </div>
          </aside>
        </ViewTransition>
        {children}
      </div>
    </CalendarVisibilityProvider>
  );
}
