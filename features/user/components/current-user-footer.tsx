import { ThemeToggle } from '@/components/theme/theme-toggle';
import { LogOutButton } from '@/features/user/components/log-out-button';
import { signOut } from '@/features/user/user-actions';
import { getCurrentUser } from '@/features/user/user-queries';

export async function CurrentUserFooter({ expanded = false }: { expanded?: boolean }) {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div
      className={
        expanded
          ? 'flex flex-row items-center gap-1 px-3 py-3'
          : 'flex flex-col items-center gap-1 px-0 py-3 lg:flex-row lg:px-3'
      }
    >
      <span className="bg-card text-muted ring-divider dark:bg-card-dark dark:ring-divider-dark grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold uppercase ring-1">
        {user.name.charAt(0)}
      </span>
      <form action={signOut}>
        <LogOutButton />
      </form>
      <div className={expanded ? 'ml-auto block' : 'ml-auto hidden lg:block'}>
        <ThemeToggle />
      </div>
    </div>
  );
}
