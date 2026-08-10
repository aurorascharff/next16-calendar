import { cn } from '@/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

type Props = ComponentProps<'input'> & {
  variant?: 'checkbox' | 'default' | 'title' | 'unstyled';
};

const base =
  'border-divider placeholder-gray focus:border-accent focus:ring-accent/25 dark:border-divider-dark w-full rounded-md border bg-white px-3 py-2 text-sm text-black transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-card disabled:text-muted disabled:opacity-60 dark:bg-[#1c1c1c] dark:text-white dark:disabled:bg-card-dark';

const variants: Record<NonNullable<Props['variant']>, string> = {
  checkbox: 'accent-action size-4 w-auto cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
  default: base,
  title: cn(base, 'h-12 bg-white px-3 pr-11 text-base font-semibold tracking-tight sm:text-xl dark:bg-card-dark'),
  unstyled: '',
};

export function Input({ className, type, variant = 'default', ...props }: Props) {
  return (
    <input
      className={cn(
        variants[type === 'hidden' ? 'unstyled' : variant],
        type === 'time' &&
          'block max-w-full min-w-0 appearance-none overflow-hidden [&::-webkit-date-and-time-value]:min-h-[1em] [&::-webkit-date-and-time-value]:text-left',
        className,
      )}
      type={type}
      {...props}
    />
  );
}

type RadioCardProps = Omit<ComponentProps<'input'>, 'type'> & {
  children: ReactNode;
};

export function RadioCard({ children, className, ...props }: RadioCardProps) {
  return (
    <label className="relative block h-full cursor-pointer has-[:disabled]:cursor-not-allowed">
      <input
        className="peer absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        type="radio"
        {...props}
      />
      <span
        className={cn(
          'border-divider bg-surface text-muted hover:border-action/45 peer-checked:border-action peer-focus-visible:ring-action/25 dark:border-divider-dark dark:bg-surface-dark dark:hover:border-action/60 peer-disabled:text-muted/45 peer-disabled:hover:border-divider dark:peer-disabled:hover:border-divider-dark flex h-full items-center rounded-md border px-4 text-left text-sm font-medium tabular-nums transition-[background-color,border-color,color,transform] duration-150 ease-out peer-checked:text-black peer-checked:shadow-[inset_0_0_0_1px_var(--color-action)] peer-focus-visible:ring-2 peer-focus-visible:outline-none peer-disabled:cursor-not-allowed peer-disabled:line-through hover:text-black active:scale-[0.98] peer-disabled:active:scale-100 dark:peer-checked:text-white dark:hover:text-white',
          className,
        )}
      >
        {children}
      </span>
    </label>
  );
}
