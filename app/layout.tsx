import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/lib/store";
import { ReactQueryProvider } from "@/lib/providers";
import ToastContainer from "@/components/Toast";
import LayoutShell from "@/components/LayoutShell";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dualangka - Discover Hidden Gem Websites",
  description: "A curated marketplace for service-based websites built by independent creators and AI-enabled developers.",
  keywords: ["marketplace", "websites", "creators", "AI tools", "productivity"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AppProviders>
            <ErrorBoundary>
              <LayoutShell>
                {children}
              </LayoutShell>
            </ErrorBoundary>
            <ToastContainer />
          </AppProviders>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
