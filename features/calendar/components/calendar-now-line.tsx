'use client';

import { displayMinutes, END_MINUTES, HOUR_HEIGHT, START_MINUTES } from '../utils/grid';

export function NowLine({ minutes }: { minutes: number }) {
  const display = displayMinutes(minutes);
  if (display < START_MINUTES || display > END_MINUTES) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-30"
      style={{ top: ((display - START_MINUTES) / 60) * HOUR_HEIGHT }}
      suppressHydrationWarning
    >
      <div className="bg-dayline relative h-px">
        <span
          className="bg-dayline absolute -top-[3px] -left-1 size-2 rounded-full"
          style={{ animation: 'now-pulse 2s ease-in-out infinite' }}
        />
      </div>
    </div>
  );
}
