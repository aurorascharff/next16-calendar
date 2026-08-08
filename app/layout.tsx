import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Toaster } from '@/components/toaster'
import './globals.css'

export const viewport: Viewport = { viewportFit: 'cover' }

export const metadata: Metadata = {
  description: 'A calendar workspace built with Next.js Cache Components and View Transitions.',
  title: { default: 'Pace', template: '%s · Pace' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-surface text-black antialiased dark:bg-surface-dark dark:text-white">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
