import { LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { IconButton } from '@/components/ui/icon-button';
import { signOut } from '@/features/user/user-actions';
import { getCurrentUser } from '@/features/user/user-queries';

export async function CurrentUserFooter() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex flex-col items-center gap-1 px-0 py-3 lg:flex-row lg:px-3">
      <span className="bg-accent/15 text-accent ring-accent/20 grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold uppercase ring-1">
        {user.name.charAt(0)}
      </span>
      <form action={signOut}>
        <IconButton label="Log out" size="sm" type="submit">
          <LogOut className="size-4" />
        </IconButton>
      </form>
      <div className="ml-auto hidden lg:block">
        <ThemeToggle />
      </div>
    </div>
  );
}
