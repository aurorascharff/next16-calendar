import { isPrefetchEnabled } from './demo-queries';
import { isSlowEnabled } from './demo-slow';
import { DemoToolbarClient } from './demo-toolbar-client';

export async function DemoToolbar() {
  const [prefetchEnabled, slowEnabled] = await Promise.all([isPrefetchEnabled(), isSlowEnabled()]);

  return <DemoToolbarClient prefetchEnabled={prefetchEnabled} slowEnabled={slowEnabled} />;
}
