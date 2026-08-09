import { ThemeToggle } from '@/components/theme/theme-toggle';

export function WorkspaceHeaderActions() {
  return (
    <div className="flex items-center gap-1">
      <ThemeToggle />
    </div>
  );
}
