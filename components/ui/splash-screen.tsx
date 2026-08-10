import { FlowMark } from '@/components/ui/flow-mark';
import { cn } from '@/lib/utils';

export function SplashScreen({ className, label = 'Loading Flow' }: { className?: string; label?: string }) {
  return (
    <div
      aria-label={label}
      className={cn(
        'bg-surface dark:bg-surface-dark grid min-h-0 min-w-0 flex-1 place-items-center overflow-hidden',
        className,
      )}
      role="status"
    >
      <FlowMark animated className="size-28 opacity-70 drop-shadow-[0_12px_28px_rgb(27_80_255/0.16)]" />
    </div>
  );
}
