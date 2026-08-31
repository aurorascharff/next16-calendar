import { CalendarSidebarBrand, WorkspaceNavigationLinks } from '@/components/calendar-navigation';
import { MobileCalendarSidebar } from '@/components/mobile-calendar-sidebar';
import { AnimatedSuspense } from '@/components/ui/animated-suspense';
import ErrorBoundary from '@/components/ui/error-boundary';
import { CalendarList, CalendarListFallback } from '@/features/calendar/components/calendar-list';
import { NewCalendarButton } from '@/features/calendar/components/calendar-manager';
import { MiniMonth, MiniMonthSkeleton } from '@/features/calendar/components/mini-month';
import { CurrentUserFooter } from '@/features/user/components/current-user-footer';
import { CalendarVisibilityProvider } from '@/providers/calendar-visibility-provider';
import type { ReactNode } from 'react';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <CalendarVisibilityProvider>
      <div className="bg-surface dark:bg-surface-dark flex min-h-svh md:h-dvh md:min-h-0">
        <div className="hidden h-dvh w-[4.5rem] shrink-0 flex-col md:flex lg:w-64">
          <aside className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark flex min-h-0 flex-1 flex-col items-center border-r p-3 lg:items-stretch">
            <CalendarSidebarContent />
          </aside>
          <CalendarSidebarFooter />
        </div>
        <MobileCalendarSidebar
          sidebar={
            <>
              <CalendarSidebarContent expanded />
              <CalendarSidebarFooter expanded />
            </>
          }
        >
          {children}
        </MobileCalendarSidebar>
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
          <AnimatedSuspense fallback={<MiniMonthSkeleton />}>
            <MiniMonth />
          </AnimatedSuspense>
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
          <ErrorBoundary compact title="Calendars unavailable">
            <AnimatedSuspense fallback={<CalendarListFallback expanded={expanded} />}>
              <CalendarList expanded={expanded} />
            </AnimatedSuspense>
          </ErrorBoundary>
          <div
            aria-hidden
            className="from-surface dark:from-surface-dark pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t to-transparent"
          />
        </div>
      </div>
    </>
  );
}

function CalendarSidebarFooter({ expanded = false }: { expanded?: boolean }) {
  return (
    <div
      className={
        expanded
          ? 'border-divider dark:border-divider-dark -mx-3 mt-2 -mb-3 flex-none border-t'
          : 'border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark flex-none border-t border-r'
      }
      style={expanded ? undefined : { viewTransitionName: 'sidebar' }}
    >
      <AnimatedSuspense fallback={<div className={expanded ? 'h-[60px]' : 'h-[92px] lg:h-[60px]'} />}>
        <CurrentUserFooter expanded={expanded} />
      </AnimatedSuspense>
    </div>
  );
}
