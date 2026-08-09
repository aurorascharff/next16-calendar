import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/toaster';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = { viewportFit: 'cover' };

export const metadata: Metadata = {
  description: 'A calendar workspace built with Next.js 16 Cache Components and View Transitions.',
  title: { default: 'Pace', template: '%s · Pace' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="bg-surface dark:bg-surface-dark flex min-h-dvh flex-col text-black antialiased dark:text-white">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
