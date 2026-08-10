import { useId, type SVGProps } from 'react';
import { cn } from '@/lib/utils';

type Props = SVGProps<SVGSVGElement> & {
  animated?: boolean;
  tone?: 'brand' | 'current';
};

export function FlowMark({ animated = false, className, tone = 'brand', ...props }: Props) {
  const gradientId = useId().replaceAll(':', '');
  const fill = tone === 'brand' ? `url(#${gradientId})` : 'currentColor';

  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
      className={cn('text-primary', animated && 'flow-mark-enter', className)}
      {...props}
    >
      {tone === 'brand' ? (
        <defs>
          <linearGradient id={gradientId} x1="14" y1="19" x2="58" y2="53" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="0.5" stopColor="#2563eb" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      ) : null}
      <rect x="14" y="19" width="34" height="9" rx="4.5" fill={fill} />
      <rect x="26" y="31.5" width="32" height="9" rx="4.5" fill={fill} />
      <rect x="14" y="44" width="26" height="9" rx="4.5" fill={fill} />
    </svg>
  );
}
