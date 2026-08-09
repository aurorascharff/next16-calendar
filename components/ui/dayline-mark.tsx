import type { SVGProps } from 'react';

export function DaylineMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 72 72" fill="none" aria-hidden="true" {...props}>
      <rect x="14" y="19" width="34" height="9" rx="4.5" fill="#1B50FF" />
      <rect x="26" y="31.5" width="32" height="9" rx="4.5" fill="#1B50FF" />
      <rect x="14" y="44" width="26" height="9" rx="4.5" fill="#1B50FF" />
    </svg>
  );
}
