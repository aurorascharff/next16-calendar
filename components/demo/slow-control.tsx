import { isSlowEnabled } from './demo-slow';
import { SlowToggle } from './slow-toggle';

export async function SlowControl({ variant }: { variant?: 'icon' | 'pill' }) {
  const enabled = await isSlowEnabled();
  return <SlowToggle enabled={enabled} variant={variant} />;
}
