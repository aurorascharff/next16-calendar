import { cn } from '@/lib/utils';
import { useId } from 'react';
import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & {
  animated?: boolean;
  gradient?: boolean;
};

export function DaylineMark({ animated = false, className, gradient = false, ...props }: Props) {
  const gradientId = useId().replaceAll(':', '');
  const fill = gradient ? `url(#${gradientId})` : 'currentColor';

  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
      className={cn('text-primary', animated && 'dayline-mark-enter', className)}
      {...props}
    >
      {gradient ? (
        <defs>
          <linearGradient id={gradientId} x1="12" x2="60" y1="18" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6f8cff" stopOpacity="0.58" />
            <stop offset="0.48" stopColor="#765cf0" />
            <stop offset="1" stopColor="#42b7d5" stopOpacity="0.68" />
          </linearGradient>
        </defs>
      ) : null}
      <rect x="14" y="19" width="34" height="9" rx="4.5" fill={fill} />
      <rect x="26" y="31.5" width="32" height="9" rx="4.5" fill={fill} />
      <rect x="14" y="44" width="26" height="9" rx="4.5" fill={fill} />
    </svg>
  );
}
