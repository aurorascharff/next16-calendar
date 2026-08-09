'use client';

import { useSyncExternalStore } from 'react';

const NO_PREFETCH_COOKIE = 'no-prefetch';

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return document.cookie.split('; ').some(cookie => cookie === `${NO_PREFETCH_COOKIE}=1`);
}

function getServerSnapshot() {
  return false;
}

export function usePrefetchDefault() {
  const disabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return disabled ? null : true;
}
