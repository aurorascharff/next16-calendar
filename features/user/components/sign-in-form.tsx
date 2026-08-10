'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from '../user-actions';

export function SignInForm() {
  const [state, formAction] = useActionState(signIn, null);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-3">
      <label className="block">
        <span className="text-muted mb-1.5 block text-xs font-medium">Email</span>
        <Input
          aria-describedby={state?.error ? 'sign-in-error' : undefined}
          aria-invalid={state?.error ? true : undefined}
          autoComplete="email"
          autoFocus
          defaultValue="demo@example.com"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </label>
      {state?.error ? (
        <p className="text-danger text-sm" id="sign-in-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button className="mt-1 w-full py-2.5" type="submit">
        Continue
      </Button>
    </form>
  );
}
