import { CalendarNavigation, MobileCalendarNavigation } from '@/components/calendar-navigation';
import { CalendarVisibilityProvider } from '@/features/calendar/components/calendar-visibility';
import type { ReactNode } from 'react';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <CalendarVisibilityProvider>
      <div className="bg-surface dark:bg-surface-dark flex min-h-dvh pb-16 md:h-dvh md:pb-0">
        <CalendarNavigation />
        {children}
        <MobileCalendarNavigation />
      </div>
    </CalendarVisibilityProvider>
  );
}
