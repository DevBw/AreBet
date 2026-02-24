import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MainNav } from "@/components/layout/main-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AreBet",
  description: "Smart Betting. Simple Insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="site-header-inner">
              <Link href="/" className="brand">
                AreBet
              </Link>
              <MainNav />
            </div>
          </header>
          <Breadcrumbs />
          {children}
          <footer className="site-footer">
            <div className="site-footer-inner">
              <span>AreBet</span>
              <span>Built for fast football betting insights</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
