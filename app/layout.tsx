import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/lib/store";
import ToastContainer from "@/components/Toast";
import LayoutShell from "@/components/LayoutShell";

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
        <AppProviders>
          <LayoutShell>
            {children}
          </LayoutShell>
          <ToastContainer />
        </AppProviders>
      </body>
    </html>
  );
}
