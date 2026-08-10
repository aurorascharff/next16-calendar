import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

type Props = ComponentProps<'textarea'> & {
  variant?: 'default' | 'title';
};

const base =
  'border-divider placeholder-gray focus:border-accent focus:ring-accent/25 dark:border-divider-dark disabled:bg-card disabled:text-muted dark:disabled:bg-card-dark w-full rounded-md border bg-white px-3 py-2 text-sm text-black transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#1c1c1c] dark:text-white';

const variants: Record<NonNullable<Props['variant']>, string> = {
  default: cn(base, 'resize-y'),
  title: cn(
    base,
    'h-12 resize-none bg-card/35 px-2 py-1 pr-10 text-base font-semibold leading-5 tracking-tight sm:h-14 sm:py-1.5 sm:text-xl sm:leading-7 dark:bg-card-dark/35',
  ),
};

export function Textarea({ className, variant = 'default', ...props }: Props) {
  return <textarea className={cn(variants[variant], className)} {...props} />;
}
