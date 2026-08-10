import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

type Props = ComponentProps<'select'> & {
  leading?: ReactNode;
};

export function Select({ children, className, leading, ...props }: Props) {
  return (
    <span className="relative block min-w-0">
      {leading ? (
        <span className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">{leading}</span>
      ) : null}
      <select
        className={cn(
          'border-divider placeholder-gray focus:border-accent focus:ring-accent/25 dark:border-divider-dark disabled:bg-card disabled:text-muted dark:disabled:bg-card-dark w-full appearance-none rounded-md border bg-white px-3 py-2 pr-8 text-sm text-black transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#1c1c1c] dark:text-white',
          leading && 'pl-8',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="text-muted pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2"
      />
    </span>
  );
}
