import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

import "./globals.css";

export const metadata: Metadata = {
  title: "Giant Auto Import",
  description: "Import cars from all over the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen w-full flex-col">
            <Navbar />
            <main className="flex flex-1 flex-col gap-4 md:gap-8">
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
      </body>
    </html>
  );
}
