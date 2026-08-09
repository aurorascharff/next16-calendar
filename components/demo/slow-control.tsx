import { isSlowEnabled } from './demo-slow';
import { SlowToggle } from './slow-toggle';

export async function SlowControl() {
  const enabled = await isSlowEnabled();
  return <SlowToggle enabled={enabled} />;
}
