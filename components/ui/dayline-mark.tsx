import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

type Props = SVGProps<SVGSVGElement> & {
  animated?: boolean;
};

export function DaylineMark({ animated = false, className, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
      className={cn('text-primary', animated && 'dayline-mark-enter', className)}
      {...props}
    >
      <rect x="14" y="19" width="34" height="9" rx="4.5" fill="currentColor" />
      <rect x="26" y="31.5" width="32" height="9" rx="4.5" fill="currentColor" />
      <rect x="14" y="44" width="26" height="9" rx="4.5" fill="currentColor" />
    </svg>
  );
}
