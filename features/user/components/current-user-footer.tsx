import { LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { IconButton } from '@/components/ui/icon-button';
import { signOut } from '@/features/user/user-actions';
import { getCurrentUser } from '@/features/user/user-queries';

export async function CurrentUserFooter() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex items-center gap-1 px-3 py-3">
      <span className="bg-accent grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white uppercase">
        {user.name.charAt(0)}
      </span>
      <form action={signOut}>
        <IconButton label="Log out" size="sm" type="submit">
          <LogOut className="size-4" />
        </IconButton>
      </form>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </div>
  );
}
