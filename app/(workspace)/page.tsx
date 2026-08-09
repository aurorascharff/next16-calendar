import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { dateKey } from '@/features/calendar/calendar-utils';
import type { Route } from 'next';

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeRedirect />
    </Suspense>
  );
}

async function HomeRedirect() {
  await connection();
  redirect(`/calendar/${dateKey(new Date())}` as Route);
  return null;
}
