"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { ProfilePanel } from "@/components/features/profile-panel";
import { DangerZone } from "@/components/features/danger-zone";
import { useAuth } from "@/lib/auth/context";
import { usePredictions } from "@/lib/hooks/use-predictions";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { useMatchRatings } from "@/lib/hooks/use-match-ratings";

const QUICK_LINKS = [
  { href: "/predictions",      label: "My Tracker",    icon: "📋" },
  { href: "/favorites",        label: "Favorites",     icon: "★" },
  { href: "/settings",         label: "Settings",      icon: "⚙" },
  { href: "/insights",         label: "Insights",      icon: "📊" },
  { href: "/live-matches",     label: "Live Matches",  icon: "⚽" },
  { href: "/help",             label: "Help / FAQ",    icon: "?" },
];

export default function UserDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { stats, records } = usePredictions();
  const { favorites } = useFavorites();
  const { ratings } = useMatchRatings();
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    if (user) {
      setDisplayName(
        (user.user_metadata?.display_name as string | undefined) ??
        (user.user_metadata?.full_name as string | undefined) ??
        user.email ??
        "User"
      );
    }
  }, [user]);

  if (authLoading) {
    return (
      <main className="page-wrap">
        <PageHeader title="Profile" subtitle="Loading your account…" />
        <div className="cards-grid">
          <Card title="">
            <Skeleton className="skeleton-line w-full" />
            <Skeleton className="skeleton-line w-40" />
          </Card>
        </div>
      </main>
    );
  }

  // Guest view
  if (!user) {
    return (
      <main className="page-wrap">
        <PageHeader
          title="Profile"
          subtitle="Sign in to sync your preferences, predictions, and favorites."
        />
        <div className="profile-guest">
          <Avatar seed="Guest" size="xl" />
          <h2 className="profile-guest-title">You&apos;re browsing as a guest</h2>
          <p className="profile-guest-desc">
            Create a free account to save your picks across devices and unlock the full AreBet experience.
          </p>
          <div className="profile-guest-btns">
            <Link href="/auth/signup" className="btn btn-primary">Create account</Link>
            <Link href="/auth/login"  className="btn btn-muted">Sign in</Link>
          </div>
          <div className="profile-stats-grid">
            <div className="profile-stat">
              <span className="profile-stat-value">{records.length}</span>
              <span className="profile-stat-label">Picks tracked</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">
                {stats.winRate > 0 ? `${stats.winRate.toFixed(0)}%` : "—"}
              </span>
              <span className="profile-stat-label">Win rate</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{favorites.length}</span>
              <span className="profile-stat-label">Favorites</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">
                {Object.keys(ratings).length}
              </span>
              <span className="profile-stat-label">Ratings given</span>
            </div>
          </div>
          <DangerZone isAuthed={false} />
        </div>
      </main>
    );
  }

  // Authenticated view
  return (
    <main className="page-wrap">
      <PageHeader
        title="Profile"
        subtitle="Account overview, activity stats, and preferences."
        actions={
          <Link className="btn btn-muted" href="/settings">Settings</Link>
        }
      />

      {/* Profile panel */}
      <Card title="">
        <ProfilePanel
          user={user}
          onUpdated={(name) => setDisplayName(name)}
        />
      </Card>

      {/* Activity stats */}
      <Card title="Activity">
        <div className="profile-stats-grid">
          <div className="profile-stat">
            <span className="profile-stat-value">{records.length}</span>
            <span className="profile-stat-label">Picks tracked</span>
          </div>
          <div className="profile-stat">
            <span className={`profile-stat-value${stats.winRate > 0 ? " is-positive" : ""}`}>
              {stats.winRate > 0 ? `${stats.winRate.toFixed(0)}%` : "—"}
            </span>
            <span className="profile-stat-label">Win rate</span>
          </div>
          <div className="profile-stat">
            <span className={`profile-stat-value${stats.pnl > 0 ? " is-positive" : stats.pnl < 0 ? " is-negative" : ""}`}>
              {stats.totalStaked > 0
                ? `${stats.pnl >= 0 ? "+" : ""}£${stats.pnl.toFixed(2)}`
                : "—"}
            </span>
            <span className="profile-stat-label">P&amp;L</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{favorites.length}</span>
            <span className="profile-stat-label">Favorites</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">
              {Object.keys(ratings).length}
            </span>
            <span className="profile-stat-label">Ratings given</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">Starter</span>
            <span className="profile-stat-label">Plan</span>
          </div>
        </div>
      </Card>

      {/* Quick links */}
      <Card title="Quick access">
        <div className="profile-links-grid">
          {QUICK_LINKS.map(({ href, label, icon }) => (
            <Link key={href} href={href} className="profile-link-card">
              <span className="profile-link-icon">{icon}</span>
              <span className="profile-link-label">{label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <DangerZone isAuthed={true} />
    </main>
  );
}
