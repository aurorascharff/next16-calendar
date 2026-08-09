import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  );
}
