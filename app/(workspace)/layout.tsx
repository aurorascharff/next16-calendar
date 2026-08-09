import { Suspense } from 'react';
import { CalendarNavigation, MobileCalendarNavigation } from '@/components/calendar-navigation';
import { CalendarVisibilityProvider } from '@/features/calendar/components/calendar-visibility';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <CalendarVisibilityProvider>
      <div className="bg-surface dark:bg-surface-dark flex min-h-dvh pb-16 md:h-dvh md:pb-0">
        <Suspense fallback={<CalendarNavigationFallback />}>
          <CalendarNavigation />
        </Suspense>
        {children}
        <Suspense fallback={<MobileCalendarNavigationFallback />}>
          <MobileCalendarNavigation />
        </Suspense>
      </div>
    </CalendarVisibilityProvider>
  );
}

function CalendarNavigationFallback() {
  return (
    <aside className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark hidden h-dvh w-64 shrink-0 border-r md:block" />
  );
}

function MobileCalendarNavigationFallback() {
  return (
    <nav className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark fixed inset-x-0 bottom-0 z-30 h-16 border-t md:hidden" />
  );
}
