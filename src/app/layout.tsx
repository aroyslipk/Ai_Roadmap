import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import ClientOnly from '@/components/client-only';
import { OfflineIndicator } from '@/components/offline-indicator';
import { ServiceWorkerRegistration } from '@/components/sw-registration';

export const metadata: Metadata = {
  title: 'AI_Roadmap',
  description: 'Your daily guide to mastering Python and Data Science.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3f51b5' },
    { media: '(prefers-color-scheme: dark)', color: '#5c6bc0' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI Roadmap',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background')} suppressHydrationWarning>
        <FirebaseClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ServiceWorkerRegistration />
            {children}
            <ClientOnly>
              <Toaster />
              <OfflineIndicator />
            </ClientOnly>
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
