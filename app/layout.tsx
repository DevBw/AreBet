import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MainNav } from "@/components/layout/main-nav";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { DensityShell } from "@/components/features/density-shell";
import { StickinessSync } from "@/components/features/stickiness-sync";
import { GlobalSearch } from "@/components/features/global-search";
import { ThemeToggle } from "@/components/features/theme-toggle";
import { PwaRegister } from "@/components/features/pwa-register";
import { OnboardingModal } from "@/components/features/onboarding-modal";
import { AuthProvider } from "@/lib/auth/context";
import { ToastProvider } from "@/components/ui/toast";
import { BetSlipProvider, BetSlipPanel } from "@/components/features/bet-slip-panel";
import "./globals.css";

export const metadata: Metadata = {
  title: "AreBet",
  description: "Smart Betting. Simple Insights.",
  icons: {
    icon: "/arebet-logo.svg",
    apple: "/arebet-logo.svg",
  },
  other: {
    "theme-color": "#22c55e",
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
        {/* Anti-FOUC: apply stored theme before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('arebet:theme:v1');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();`,
          }}
        />
        <ToastProvider>
        <BetSlipProvider>
        <AuthProvider>
          <PwaRegister />
          <OnboardingModal />
          <StickinessSync />
          <DensityShell>
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
                <div className="site-header-actions">
                  <GlobalSearch />
                  <ThemeToggle />
                  <MainNav />
                </div>
              </div>
            </header>
            <Breadcrumbs />
            <main className="site-main">
              {children}
            </main>
            <MobileBottomNav />
            <BetSlipPanel />
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
          </DensityShell>
        </AuthProvider>
        </BetSlipProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
