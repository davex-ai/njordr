import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Njörðr", template: "%s · Njörðr" },
  description: "Njörðr is a modern marketplace for things worth having.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
