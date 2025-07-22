import dynamic from 'next/dynamic';
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/providers/react-query";
import { ThemeProvider } from "@/providers/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Suspense } from "react";
import "./globals.css";
import LoadingSpinner from "@/components/loading-spinner";
import NextTopLoader from 'nextjs-toploader';

// Dynamic imports with loading fallbacks
const DynamicNavbar = dynamic(() => import('@/components/navbar-wrapper'), {
  loading: () => <LoadingSpinner />,
  ssr: true,
});

const DynamicFooter = dynamic(() => import('@/components/footer'), {
  loading: () => <LoadingSpinner />,
  ssr: true,
});

// Metadata configuration
export const metadata: Metadata = {
  title: "Giant Auto Import",
  description: "Import cars from all over the world",
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'Giant Auto Import',
    description: 'Import cars from all over the world',
    siteName: 'Giant Auto Import',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

// Root layout component props
interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="text-primary scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://giantautoimportimages.ec17bb88a597d2c1d369945a578a8403.r2.cloudflarestorage.com" />
        <link rel="preconnect" href="https://pub-790f032d851548ee80b9672b151ea280.r2.dev" />
        <link rel="preconnect" href="https://media.mtlworld.win" />
        <link rel="preconnect" href="https://admin.app.mtlworld.com" />
        <link rel="preconnect" href="https://valetapp.pro" />
      </head>
      <body className="antialiased">
        <NextTopLoader />
        <script>0</script>
        <NextIntlClientProvider messages={messages}>
          <ReactQueryProvider>
            <SpeedInsights />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              forcedTheme={undefined}
              themes={['light', 'dark', 'system']}
              storageKey="giant-auto-theme"
            >
              <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white transition-colors duration-300">
                <Suspense fallback={<LoadingSpinner />}>
                  <DynamicNavbar />
                </Suspense>

                <main
                  id="main-content"
                  className="flex flex-1 flex-col gap-4 md:gap-8 w-full py-8 pt-24 md:pt-8"
                >
                  <div className="w-full">
                    <Suspense fallback={<LoadingSpinner />}>
                      {children}
                    </Suspense>
                  </div>
                </main>

                <DynamicFooter />

                <Toaster
                  closeButton={true}
                  theme="system"
                  expand={true}
                  richColors={true}
                  className="!font-sans"
                />
              </div>
            </ThemeProvider>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
