import { Sunrise } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { SignInForm } from '@/features/user/components/sign-in-form';
import { getCurrentUser } from '@/features/user/user-queries';

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <LoginRedirect />
      </Suspense>
      <main className="bg-surface dark:bg-surface-dark grid min-h-dvh place-items-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold tracking-tight">
            <span className="bg-accent relative grid size-8 place-items-center overflow-hidden rounded-md text-white">
              <Sunrise className="size-5" strokeWidth={2.25} />
              <span className="bg-dayline absolute inset-x-0 bottom-0 h-0.5" />
            </span>
            <span>Dayline</span>
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
