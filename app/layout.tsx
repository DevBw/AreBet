import type { Metadata } from "next";
import Link from "next/link";
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
              <nav className="site-nav" aria-label="Primary">
                <Link href="/">Home</Link>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/auth/login">Login</Link>
                <Link href="/admin">Admin</Link>
              </nav>
            </div>
          </header>
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
