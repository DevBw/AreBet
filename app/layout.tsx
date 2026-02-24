import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MainNav } from "@/components/layout/main-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AreBet",
  description: "Smart Betting. Simple Insights.",
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
  const shortSha = buildInfo.sha ? buildInfo.sha.slice(0, 7) : "local";
  const buildLabel = buildInfo.ref ? `${buildInfo.ref}@${shortSha}` : shortSha;
  const buildTime = buildInfo.time ? ` · ${buildInfo.time}` : "";

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
              <span className="footer-meta">Built for fast football betting insights</span>
              <span className="footer-meta">Build {buildLabel}{buildTime}</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
