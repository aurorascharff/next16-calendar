'use client';

import { LogOut } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { IconButton } from '@/components/ui/icon-button';
import { Spinner } from '@/components/ui/spinner';

export function LogOutButton() {
  const { pending } = useFormStatus();

  return (
    <IconButton disabled={pending} label="Log out" size="sm" type="submit">
      {pending ? <Spinner /> : <LogOut className="size-4" />}
    </IconButton>
  );
}
