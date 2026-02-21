import Link from "next/link";
import { TierBadge } from "@/components/features/tier-badge";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="page-wrap">
      <section className="hero">
        <p className="eyebrow">Football Betting Intelligence Platform</p>
        <h1>Smart Betting. Simple Insights.</h1>
        <p className="hero-copy">
          Track live momentum, compare markets, and spot value bets with a clean,
          responsive workflow.
        </p>
        <div className="hero-actions">
          <Link href="/dashboard" className="btn btn-primary">
            Open Dashboard
          </Link>
          <Link href="/auth/login" className="btn btn-muted">
            Sign In
          </Link>
        </div>
      </section>

      <section className="kpi-strip" aria-label="Platform highlights">
        <article className="kpi">
          <span className="kpi-label">Coverage</span>
          <strong>Top Leagues</strong>
        </article>
        <article className="kpi">
          <span className="kpi-label">Updates</span>
          <strong>Near Real-Time</strong>
        </article>
        <article className="kpi">
          <span className="kpi-label">Plans</span>
          <strong>Free / Pro / Elite</strong>
        </article>
      </section>

      <section className="cards-grid" aria-label="Membership tiers">
        <Card>
          <h2>Free</h2>
          <p className="price">$0</p>
          <TierBadge label="Starter" />
          <ul>
            <li>Basic live scores</li>
            <li>Match information</li>
            <li>League standings</li>
          </ul>
        </Card>
        <Card className="panel-accent">
          <h2>Pro</h2>
          <p className="price">$7.99/mo</p>
          <TierBadge label="Most Popular" />
          <ul>
            <li>AI predictions</li>
            <li>Odds comparison</li>
            <li>Deep match statistics</li>
            <li>Favorites and live events</li>
          </ul>
        </Card>
        <Card>
          <h2>Elite</h2>
          <p className="price">$12.99/mo</p>
          <TierBadge label="Advanced" />
          <ul>
            <li>Advanced prediction engine</li>
            <li>AI insights and bet builder</li>
            <li>Push notifications</li>
            <li>Priority support</li>
          </ul>
        </Card>
      </section>

      <section className="quick-links" aria-label="Quick links">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/admin">Admin Console</Link>
        <Link href="/api/health">API Health Route</Link>
      </section>
    </main>
  );
}
