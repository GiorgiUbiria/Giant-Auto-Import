import type { Metadata } from "next";

import { SpeedInsights } from "@vercel/speed-insights/next"

import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";
import ReactQueryProvider from "@/providers/react-query";

export const metadata: Metadata = {
  title: "Giant Auto Import",
  description: "Import cars from all over the world",
};

interface RootLayoutProps {
  children: React.ReactNode;
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
              <div className="flex min-h-screen w-full flex-col dark:bg-gray-900 bg-gray-300">
                <Navbar />
                <main className="flex flex-1 flex-col gap-4 md:gap-8 mt-12 md:mt-0">
                  {children}
                </main>
                <Footer />
                <Toaster
                  closeButton={true}
                  invert={true}
                  expand={true}
                  richColors={true}
                />
              </div>
            </ThemeProvider>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
