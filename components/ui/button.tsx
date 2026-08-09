'use client';

import { cloneElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'default' | 'sm' | 'icon';

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  render?: ReactElement<{ className?: string; children?: ReactNode }>;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100';

const sizes: Record<Size, string> = {
  default: 'px-4 py-2 text-sm',
  icon: 'size-9',
  sm: 'px-3 py-1.5 text-xs',
};

const variants: Record<Variant, string> = {
  ghost: 'text-muted hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white',
  primary: 'bg-accent text-white shadow-sm shadow-black/10 hover:bg-accent-hover dark:shadow-black/30',
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
    return cloneElement(render, { className: cn(classes, renderClassName), ...props }, content);
  }

  return (
    <button className={classes} disabled={isDisabled} type={type} {...props}>
      {content}
    </button>
  );
}
