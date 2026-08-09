import { ThemeToggle } from '@/components/theme/theme-toggle';
import { GitHubIcon } from '@/components/ui/github-icon';
import { IconButton } from '@/components/ui/icon-button';

const REPO_URL = 'https://github.com/aurorascharff/next16-calendar';

export function WorkspaceHeaderActions() {
  return (
    <div className="flex items-center gap-1">
      <ThemeToggle />
      <IconButton external href={REPO_URL} label="View source on GitHub" size="sm">
        <GitHubIcon className="size-4" />
      </IconButton>
    </div>
  );
}
