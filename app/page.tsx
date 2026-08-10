import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { SplashScreen } from '@/components/ui/splash-screen';
import { dateKey } from '@/features/calendar/calendar-utils';
import type { Route } from 'next';

export default function HomePage() {
  return (
    <main className="flex min-w-0 flex-1">
      <Suspense fallback={<SplashScreen label="Opening calendar" />}>
        <TodayRedirect />
      </Suspense>
    </main>
  );
}

async function TodayRedirect() {
  await connection();
  return redirect(`/calendar/${dateKey(new Date())}` as Route);
}
