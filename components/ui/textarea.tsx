import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

type Props = ComponentProps<'textarea'> & {
  variant?: 'default' | 'title';
};

const base =
  'border-divider placeholder-gray focus:border-accent focus:ring-accent/25 dark:border-divider-dark disabled:bg-card disabled:text-muted dark:disabled:bg-card-dark w-full rounded-md border bg-white px-3 py-2 text-sm text-black transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#1c1c1c] dark:text-white';

const variants: Record<NonNullable<Props['variant']>, string> = {
  default: cn(base, 'resize-y'),
  title:
    'border-divider placeholder-gray focus:border-primary dark:border-divider-dark -mx-2 h-12 w-[calc(100%+1rem)] resize-none overflow-hidden rounded-md border bg-white px-2 py-0 pr-12 text-base leading-5 font-semibold tracking-tight text-black transition-colors focus:ring-0 focus:outline-none sm:h-14 sm:text-xl sm:leading-7 dark:bg-card-dark dark:text-white',
};

export function Textarea({ className, variant = 'default', ...props }: Props) {
  return <textarea className={cn(variants[variant], className)} {...props} />;
}
