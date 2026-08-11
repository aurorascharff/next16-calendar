'use client';

import * as Ariakit from '@ariakit/react';
import { CircleHelp, Eye, EyeOff, Gauge, Wifi, WifiOff, Zap, ZapOff } from 'lucide-react';
import { useOffline } from 'next/offline';
import { type ButtonHTMLAttributes, type ReactNode, useOptimistic } from 'react';
import { Boundary, useBoundaryMode } from '@/components/internal/boundary';
import { cn } from '@/lib/utils';
import { setSlow, setPrefetch } from './demo-actions';
import { setSimulatedOffline } from './offline-mode';

function Divider() {
  return <div className="bg-divider dark:bg-divider-dark h-5 w-px" />;
}

type ToggleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean;
  icon: ReactNode;
  label: string;
};

function ToggleButton({ active, className, icon, label, ...props }: ToggleButtonProps) {
  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      title={label}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
        'focus-visible:bg-accent/10 dark:focus-visible:bg-accent/20 focus-visible:outline-none',
        active ? 'text-accent' : 'text-gray',
        props.disabled && 'cursor-default',
        className,
      )}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function CookieToggle({
  enabled,
  iconOff,
  iconOn,
  label,
  onToggle,
}: {
  enabled: boolean;
  iconOff: ReactNode;
  iconOn: ReactNode;
  label: string;
  onToggle: (enabled: boolean) => Promise<void>;
}) {
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(enabled);
  const pending = optimisticEnabled !== enabled;

  return (
    <form
      action={async () => {
        const next = !optimisticEnabled;
        setOptimisticEnabled(next);
        await onToggle(next);
        window.location.reload();
      }}
    >
      <ToggleButton
        active={optimisticEnabled}
        aria-label={`${label} ${optimisticEnabled ? 'on' : 'off'}`}
        aria-pressed={optimisticEnabled}
        disabled={pending}
        icon={optimisticEnabled ? iconOn : iconOff}
        label={label}
        type="submit"
      />
    </form>
  );
}

export function DemoToolbarClient({
  prefetchEnabled,
  slowEnabled,
}: {
  prefetchEnabled: boolean;
  slowEnabled: boolean;
}) {
  const { mode, toggleMode } = useBoundaryMode();
  const offline = useOffline();
  const guide = Ariakit.useDialogStore();

  return (
    <div
      style={{ viewTransitionName: 'demo-toolbar' }}
      className="border-divider bg-surface/85 dark:border-divider-dark dark:bg-surface-dark/85 flex items-center overflow-hidden rounded-full border text-xs shadow-sm backdrop-blur-md"
    >
      <ToggleButton
        active={mode === 'on'}
        aria-label={mode === 'on' ? 'Client outlines on' : 'Client outlines off'}
        aria-pressed={mode === 'on'}
        icon={mode === 'on' ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
        label="Client"
        onClick={toggleMode}
      />
      <Divider />
      <CookieToggle
        enabled={prefetchEnabled}
        iconOff={<ZapOff className="size-3.5" />}
        iconOn={<Zap className="size-3.5" />}
        label="Prefetch"
        onToggle={setPrefetch}
      />
      <Divider />
      <CookieToggle
        enabled={slowEnabled}
        iconOff={<Gauge className="size-3.5" />}
        iconOn={<Gauge className="size-3.5" />}
        label="Delays"
        onToggle={setSlow}
      />
      <Divider />
      <ToggleButton
        active={!offline}
        aria-label={offline ? 'Simulating offline' : 'Online'}
        aria-pressed={offline}
        icon={offline ? <WifiOff className="size-3.5" /> : <Wifi className="size-3.5" />}
        label={offline ? 'Offline' : 'Online'}
        onClick={() => setSimulatedOffline(!offline)}
      />
      <Divider />
      <Ariakit.DialogDisclosure
        store={guide}
        aria-label="How this demo works"
        title="How this demo works"
        className="text-muted focus-visible:bg-accent/10 dark:focus-visible:bg-accent/20 flex h-8 items-center px-2.5 transition-colors hover:text-black focus-visible:outline-none dark:hover:text-white"
      >
        <CircleHelp className="size-3.5" />
      </Ariakit.DialogDisclosure>
      <DemoGuideDialog
        boundaries={mode === 'on'}
        guide={guide}
        offline={offline}
        prefetch={prefetchEnabled}
        slow={slowEnabled}
      />
    </div>
  );
}

function DemoGuideDialog({
  boundaries,
  guide,
  offline,
  prefetch,
  slow,
}: {
  boundaries: boolean;
  guide: Ariakit.DialogStore;
  offline: boolean;
  prefetch: boolean;
  slow: boolean;
}) {
  const rows = [
    {
      Icon: boundaries ? Eye : EyeOff,
      name: 'Client',
      on: boundaries,
      text: 'Outlines the Client Components. Everything else is server-rendered and ships no JS.',
    },
    {
      Icon: Zap,
      name: 'Prefetch',
      on: prefetch,
      text: 'Controls whether workspace links can warm route data before navigation.',
    },
    {
      Icon: Gauge,
      name: 'Delays',
      on: slow,
      text: 'Adds artificial latency to query paths so loading boundaries are visible during demos.',
    },
    {
      Icon: offline ? WifiOff : Wifi,
      name: offline ? 'Offline' : 'Online',
      on: !offline,
      text: 'Simulates browser connectivity without putting demo controls in the app content.',
    },
  ];

  return (
    <Boundary label="DemoGuide" asChild>
      <Ariakit.Dialog
        store={guide}
        backdrop={<div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />}
        className="border-divider dark:border-divider-dark fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-2xl outline-none dark:bg-black"
        unmountOnHide
      >
        <Ariakit.DialogHeading className="text-xl font-bold">How this demo works</Ariakit.DialogHeading>
        <Ariakit.DialogDescription className="text-muted mt-2 text-sm leading-relaxed">
          Flow keeps the calendar shell stable while route data streams, prefetches, or intentionally slows down for
          demos.
        </Ariakit.DialogDescription>
        <div className="mt-6 flex flex-col gap-4">
          {rows.map(({ Icon, name, on, text }) => (
            <div key={name} className="flex gap-3">
              <Icon className={cn('mt-0.5 size-4.5 shrink-0', on ? 'text-accent' : 'text-muted')} />
              <div>
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-muted mt-1 text-sm leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-divider dark:border-divider-dark mt-6 flex justify-end border-t pt-4">
          <Ariakit.DialogDismiss className="border-divider hover:bg-card dark:border-divider-dark dark:hover:bg-card-dark rounded-full border px-5 py-2 text-sm font-semibold transition-colors">
            Close
          </Ariakit.DialogDismiss>
        </div>
      </Ariakit.Dialog>
    </Boundary>
  );
}
