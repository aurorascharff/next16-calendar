import { Suspense } from 'react';
import { CalendarViewFallback } from '@/features/calendar/components/calendar-scroll-section';
import type { ReactNode } from 'react';

export default function CalendarLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <CalendarViewFallback />
        </main>
      }
    >
      {children}
    </Suspense>
  );
}
