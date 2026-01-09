import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/lib/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/Toast";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          <div className="app-layout">
            <Header />
            <main className="main-content">
              {children}
            </main>
            <Footer />
          </div>
          <ToastContainer />
        </AppProviders>
      </body>
    </html>
  );
}
