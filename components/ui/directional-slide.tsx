import { ViewTransition } from 'react';
import type { ReactNode } from 'react';

const directionalSlide = {
  'nav-back': 'nav-back',
  'nav-forward': 'nav-forward',
  default: 'none',
};

export function DirectionalSlide({ children, name }: { children: ReactNode; name: string }) {
  return (
    <ViewTransition default="none" name={name} share={directionalSlide}>
      {children}
    </ViewTransition>
  );
}
