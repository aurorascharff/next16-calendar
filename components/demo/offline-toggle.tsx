'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { useOffline } from 'next/offline';
import { cn } from '@/lib/utils';
import { setSimulatedOffline } from './offline-mode';

export function OfflineToggle({ variant = 'pill' }: { variant?: 'icon' | 'pill' }) {
  const offline = useOffline();
  const iconOnly = variant === 'icon';

  return (
    <button
      aria-label={offline ? 'Simulating offline' : 'Online'}
      aria-pressed={offline}
      className={cn(
        'border-divider dark:border-divider-dark inline-flex h-8 items-center rounded-full border text-xs font-medium transition-colors',
        iconOnly ? 'w-8 justify-center' : 'gap-2 px-2.5',
        offline
          ? 'border-transparent bg-red-500/10 text-red-600 dark:text-red-400'
          : 'text-muted hover:text-black dark:hover:text-white',
      )}
      onClick={() => setSimulatedOffline(!offline)}
      title="Simulate an offline browser"
      type="button"
    >
      {offline ? (
        <WifiOff aria-hidden className="size-3.5" strokeWidth={2.25} />
      ) : (
        <Wifi aria-hidden className="size-3.5" strokeWidth={2.25} />
      )}
      {iconOnly ? null : offline ? 'Offline' : 'Online'}
    </button>
  );
}
