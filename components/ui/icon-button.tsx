'use client';

import { cloneElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'default';

type Props = {
  children: ReactNode;
  label: string;
  size?: Size;
  href?: string;
  external?: boolean;
  render?: ReactElement<{ className?: string; children?: ReactNode }>;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  'text-muted inline-flex shrink-0 items-center justify-center rounded-md transition-colors hover:bg-card hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-card-dark dark:hover:text-white';

const sizes: Record<Size, string> = {
  default: 'size-8',
  sm: 'size-7',
};

export function IconButton({
  children,
  className,
  external,
  href,
  label,
  render,
  size = 'default',
  type = 'button',
  ...props
}: Props) {
  const classes = cn(base, sizes[size], className);

  if (render) {
    return cloneElement(
      render,
      { 'aria-label': label, className: cn(classes, render.props?.className), ...props },
      children,
    );
  }

  if (href) {
    return (
      <a
        aria-label={label}
        className={classes}
        href={href}
        {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <button aria-label={label} className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
