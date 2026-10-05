import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import InstallBanner from "@/components/InstallBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Njörðr", template: "%s · Njörðr" },
  description: "Njörðr is a modern marketplace for things worth having.",
  icons: { apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Njörðr", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#1b4965" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
        <Footer />
        <InstallBanner />
      </body>
    </html>
  );
}
