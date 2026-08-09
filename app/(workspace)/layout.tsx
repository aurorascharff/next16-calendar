import { Suspense } from 'react'
import { CalendarNavigation, MobileCalendarNavigation } from '@/components/calendar-navigation'
import { CalendarVisibilityProvider } from '@/features/calendar/components/calendar-visibility'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <CalendarVisibilityProvider>
      <div className="flex min-h-dvh bg-surface pb-16 dark:bg-surface-dark md:h-dvh md:pb-0">
        <Suspense fallback={<CalendarNavigationFallback />}>
          <CalendarNavigation />
        </Suspense>
        {children}
        <Suspense fallback={<MobileCalendarNavigationFallback />}>
          <MobileCalendarNavigation />
        </Suspense>
      </div>
    </CalendarVisibilityProvider>
  )
}

function CalendarNavigationFallback() {
  return <aside className="border-divider hidden h-dvh w-64 shrink-0 border-r bg-surface dark:border-divider-dark dark:bg-surface-dark md:block" />
}

function MobileCalendarNavigationFallback() {
  return <nav className="border-divider fixed inset-x-0 bottom-0 z-30 h-16 border-t bg-surface md:hidden dark:border-divider-dark dark:bg-surface-dark" />
}
