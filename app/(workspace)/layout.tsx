import { CalendarNavigation, MobileCalendarNavigation } from '@/components/calendar-navigation'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-surface pb-16 dark:bg-surface-dark md:h-dvh md:pb-0">
      <CalendarNavigation />
      {children}
      <MobileCalendarNavigation />
    </div>
  )
}
