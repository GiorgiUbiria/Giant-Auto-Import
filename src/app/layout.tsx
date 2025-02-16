import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/providers/react-query";
import { ThemeProvider } from "@/providers/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giant Auto Import",
  description: "Import cars from all over the world",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

// Loading component for Suspense fallback
function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-24">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="text-primary">
      <body>
        <NextIntlClientProvider messages={messages}>
          <ReactQueryProvider>
            <SpeedInsights />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-gray-900 to-black text-white">
                <Suspense fallback={<Loading />}>
                  <Navbar />
                </Suspense>
                <main className="flex flex-1 flex-col gap-4 md:gap-8 mt-12 md:mt-0 container mx-auto px-4 py-8">
                  <Suspense fallback={<Loading />}>
                    {children}
                  </Suspense>
                </main>
                <Footer />
                <Toaster
                  closeButton={true}
                  theme="dark"
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
