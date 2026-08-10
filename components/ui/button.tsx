'use client';

import { cloneElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { Boundary } from '@/components/internal/boundary';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'default' | 'sm' | 'icon';

type Props = {
  boundaryLabel?: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  render?: ReactElement<{ className?: string; children?: ReactNode }>;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 disabled:cursor-not-allowed disabled:opacity-50';

const sizes: Record<Size, string> = {
  default: 'h-9 px-4 text-sm',
  icon: 'size-9',
  sm: 'h-8 px-3 text-xs',
};

const variants: Record<Variant, string> = {
  ghost: 'text-muted hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white',
  primary: 'bg-action text-white hover:bg-action-hover',
  secondary:
    'border border-divider bg-white text-black hover:border-gray/40 hover:bg-card dark:border-divider-dark dark:bg-transparent dark:text-white dark:hover:border-gray/30 dark:hover:bg-card-dark',
};

export function buttonClasses({
  className,
  size = 'default',
  variant = 'primary',
}: {
  className?: string;
  size?: Size;
  variant?: Variant;
} = {}) {
  return cn(base, sizes[size], variants[variant], className);
}

export function Button({
  boundaryLabel = 'Button',
  children,
  variant = 'primary',
  size = 'default',
  className,
  render,
  type = 'button',
  disabled,
  ...props
}: Props) {
  const { pending } = useFormStatus();
  const isSubmit = type === 'submit';
  const isDisabled = disabled || (isSubmit && pending);
  const classes = buttonClasses({ className, size, variant });
  const content = (
    <>
      {isSubmit && pending && <Spinner />}
      {children}
    </>
  );

  if (render) {
    const renderClassName = render.props?.className;
    return (
      <Boundary label={boundaryLabel} asChild>
        {cloneElement(render, { className: cn(classes, renderClassName), ...props }, content)}
      </Boundary>
    );
  }

  return (
    <Boundary label={boundaryLabel} asChild>
      <button className={classes} disabled={isDisabled} type={type} {...props}>
        {content}
      </button>
    </Boundary>
  );
}
