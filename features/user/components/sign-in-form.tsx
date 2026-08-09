'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { signIn } from '../user-actions';

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(signIn, null);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-3">
      <label className="block">
        <span className="text-muted mb-1.5 block text-xs font-medium">Name</span>
        <input
          aria-describedby={state?.error ? 'sign-in-error' : undefined}
          aria-invalid={state?.error ? true : undefined}
          autoComplete="username"
          autoFocus
          name="name"
          placeholder="Your name"
          required
        />
      </label>
      {state?.error ? (
        <p className="text-danger text-sm" id="sign-in-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button className="mt-1 w-full py-2.5" disabled={isPending} type="submit">
        {isPending ? 'Signing in…' : 'Continue'}
      </Button>
    </form>
  );
}
