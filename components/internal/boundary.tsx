'use client';

import { cloneElement, createContext, isValidElement, useContext, useEffect, useSyncExternalStore } from 'react';

export type BoundaryMode = 'off' | 'on';

type BoundaryContextValue = {
  mode: BoundaryMode;
  toggleMode: () => void;
};

const BoundaryContext = createContext<BoundaryContextValue | null>(null);
const BOUNDARY_MODE_KEY = 'boundaryMode';
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === BOUNDARY_MODE_KEY) callback();
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

function getSnapshot(): BoundaryMode {
  return localStorage.getItem(BOUNDARY_MODE_KEY) === 'on' ? 'on' : 'off';
}

function getServerSnapshot(): BoundaryMode {
  return 'off';
}

export function BoundaryProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggleMode() {
    localStorage.setItem(BOUNDARY_MODE_KEY, mode === 'off' ? 'on' : 'off');
    listeners.forEach(listener => listener());
  }

  useEffect(() => {
    document.documentElement.classList.toggle('boundary-mode', mode === 'on');
  }, [mode]);

  return <BoundaryContext.Provider value={{ mode, toggleMode }}>{children}</BoundaryContext.Provider>;
}

export function useBoundaryMode() {
  const context = useContext(BoundaryContext);
  if (!context) throw new Error('useBoundaryMode must be used within BoundaryProvider');
  return context;
}

export function Boundary({
  children,
  label = 'Client',
  asChild = false,
}: {
  children: React.ReactNode;
  label?: string;
  asChild?: boolean;
}) {
  const { mode } = useBoundaryMode();

  if (isValidElement(children) && (asChild || typeof children.type === 'string')) {
    return cloneElement(children as React.ReactElement<{ 'data-component'?: string }>, { 'data-component': label });
  }

  if (mode === 'off') return <>{children}</>;

  return <div data-component={label}>{children}</div>;
}
