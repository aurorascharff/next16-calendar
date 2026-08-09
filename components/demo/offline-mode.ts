'use client';

let originalFetch: typeof fetch | null = null;

export function setSimulatedOffline(offline: boolean) {
  if (offline) {
    originalFetch ??= window.fetch.bind(window);
    window.fetch = () => Promise.reject(new TypeError('Failed to fetch (demo offline)'));
  } else if (originalFetch) {
    window.fetch = originalFetch;
    originalFetch = null;
  }

  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    get: () => !offline,
  });
  window.dispatchEvent(new Event(offline ? 'offline' : 'online'));
}
