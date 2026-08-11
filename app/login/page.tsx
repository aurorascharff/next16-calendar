import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { FlowMark } from '@/components/ui/flow-mark';
import { LoginCalendarPreview } from '@/features/user/components/login-calendar-preview';
import { SignInForm } from '@/features/user/components/sign-in-form';
import { getCurrentUser } from '@/features/user/user-queries';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <LoginRedirect />
      </Suspense>
      <main
        className="bg-surface dark:bg-surface-dark relative isolate grid min-h-dvh place-items-center overflow-hidden p-4 sm:p-6"
        data-login-splash
      >
        <LoginCalendarPreview />
        <div className="bg-surface/55 dark:bg-surface-dark/65 absolute inset-0 z-10 backdrop-blur-[4px]" />
        <section className="border-divider bg-surface/95 dark:border-divider-dark dark:bg-surface-dark/95 relative z-20 w-full max-w-sm rounded-2xl border p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight">
            <FlowMark animated className="size-8 shrink-0" />
            <span>Flow</span>
          </h1>
          <SignInForm />
        </section>
      </main>
    </>
  );
}

async function LoginRedirect() {
  const user = await getCurrentUser();
  if (user) redirect('/');
  return null;
}
