'use client';

import { END_MINUTES, HOUR_HEIGHT, START_HOUR } from '../utils/grid';

export function NowLine({ minutes }: { minutes: number }) {
  if (minutes < START_HOUR * 60 || minutes > END_MINUTES) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-30"
      style={{ top: ((minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT }}
      suppressHydrationWarning
    >
      <div className="bg-accent relative h-px">
        <span
          className="bg-accent absolute -top-[3px] -left-1 size-2 rounded-full"
          style={{ animation: 'now-pulse 2s ease-in-out infinite' }}
        />
      </div>
    </div>
  );
}
