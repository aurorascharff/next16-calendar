'use client';

import { useSyncExternalStore } from 'react';
import { dateKey } from '../calendar-utils';

function subscribeToMinute(callback: () => void) {
  const timeout = window.setTimeout(callback, 0);
  const interval = window.setInterval(callback, 60_000);
  return () => {
    window.clearTimeout(timeout);
    window.clearInterval(interval);
  };
}

function getMinuteSnapshot() {
  return Math.floor(Date.now() / 60_000);
}

function getServerSnapshot() {
  return null;
}

export function useNow() {
  const minute = useSyncExternalStore(subscribeToMinute, getMinuteSnapshot, getServerSnapshot);
  return minute === null ? null : new Date(minute * 60_000);
}

export function useTodayKey() {
  const now = useNow();
  return now ? dateKey(now) : null;
}
