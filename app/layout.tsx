import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MainNav } from "@/components/layout/main-nav";
import { AuthProvider } from "@/lib/auth/context";
import "./globals.css";

export const metadata: Metadata = {
  title: "AreBet",
  description: "Smart Betting. Simple Insights.",
  icons: {
    icon: "/arebet-logo.svg",
    apple: "/arebet-logo.svg",
  },
};

const buildInfo = {
  sha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_GIT_SHA ?? "",
  ref: process.env.VERCEL_GIT_COMMIT_REF ?? process.env.NEXT_PUBLIC_GIT_REF ?? "",
  time: process.env.VERCEL_BUILD_TIME ?? process.env.NEXT_PUBLIC_BUILD_TIME ?? "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only show build info in development
  const isDev = process.env.NODE_ENV === "development";
  const shortSha = buildInfo.sha ? buildInfo.sha.slice(0, 7) : "local";
  const buildLabel = buildInfo.ref ? `${buildInfo.ref}@${shortSha}` : shortSha;
  const buildTime = buildInfo.time ? ` · ${buildInfo.time}` : "";

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="site-shell">
            <header className="site-header">
              <div className="site-container site-header-inner">
                <Link href="/" className="brand">
                  <Image
                    src="/arebet-logo.svg"
                    alt="AreBet"
                    width={140}
                    height={42}
                    priority
                    className="brand-mark"
                  />
                  <span className="sr-only">AreBet</span>
                </Link>
                <MainNav />
              </div>
            </header>
            <Breadcrumbs />
            <main className="site-main">
              {children}
            </main>
            <footer className="site-footer">
              <div className="site-container site-footer-inner">
                <span className="footer-brand">
                  <Image
                    src="/arebet-logo.svg"
                    alt="AreBet"
                    width={110}
                    height={33}
                    className="footer-mark"
                  />
                </span>
                <span className="footer-meta">Built for fast football betting insights</span>
                {isDev && <span className="footer-meta">Build {buildLabel}{buildTime}</span>}
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
