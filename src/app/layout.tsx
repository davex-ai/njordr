import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Njörðr", template: "%s · Njörðr" },
  description: "Njörðr is a modern marketplace for things worth having.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
        <footer className="border-t border-line py-8 text-center text-sm text-muted">
          © {new Date().getFullYear()} Njörðr
        </footer>
      </body>
    </html>
  );
}
