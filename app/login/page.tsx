import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { FlowMark } from '@/components/ui/flow-mark';
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
      <main className="bg-surface dark:bg-surface-dark grid min-h-dvh place-items-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold tracking-tight">
            <FlowMark className="size-8 shrink-0" />
            <span>Flow</span>
          </div>
          <SignInForm />
        </div>
      </main>
    </>
  );
}

async function LoginRedirect() {
  const user = await getCurrentUser();
  if (user) redirect('/');
  return null;
}
