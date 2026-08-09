'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

const subscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();
  const active = mounted ? theme : undefined;

  return (
    <div
      style={{ viewTransitionName: 'theme-toggle' }}
      className="border-divider dark:border-divider-dark inline-flex items-center rounded-full border p-0.5"
    >
      <ToggleButton active={active === 'light'} label="Light theme" onClick={() => setTheme('light')}>
        <Sun className="size-4" />
      </ToggleButton>
      <ToggleButton active={active === 'dark'} label="Dark theme" onClick={() => setTheme('dark')}>
        <Moon className="size-4" />
      </ToggleButton>
      <ToggleButton active={active === 'system'} label="System theme" onClick={() => setTheme('system')}>
        <Monitor className="size-4" />
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'rounded-full p-1.5 transition-colors',
        active
          ? 'bg-card dark:bg-card-dark text-black dark:text-white'
          : 'text-muted hover:text-black dark:hover:text-white',
      )}
    >
      {children}
    </button>
  );
}
