import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Suspense } from 'react';
import { DemoToolbar } from '@/components/demo/demo-toolbar';
import { OfflineIndicator } from '@/components/offline-indicator';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/toaster';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = { viewportFit: 'cover' };

const description =
  'A Next.js 16.3 calendar demonstrating Instant Navigations with Cache Components and View Transitions.';

export const metadata: Metadata = {
  applicationName: 'Dayline',
  description,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'http://localhost:3000'),
  ),
  openGraph: {
    description,
    siteName: 'Dayline',
    title: 'Dayline',
    type: 'website',
  },
  title: { default: 'Dayline', template: '%s · Dayline' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="bg-surface dark:bg-surface-dark flex min-h-dvh flex-col text-black antialiased dark:text-white">
        <ThemeProvider>
          {children}
          <div className="fixed right-4 bottom-4 z-50 hidden items-end sm:flex">
            <Suspense fallback={null}>
              <DemoToolbar />
            </Suspense>
          </div>
          <Toaster />
          <OfflineIndicator />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
