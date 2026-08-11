import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number, enabled: boolean) {
  return enabled ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve();
}
