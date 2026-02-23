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
          responsive workflow built for confident decisions.
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
          <span className="kpi-label">Problem Solved</span>
          <strong>Signal Overload</strong>
        </article>
        <article className="kpi">
          <span className="kpi-label">Solution</span>
          <strong>Prioritized Match Insights</strong>
        </article>
        <article className="kpi">
          <span className="kpi-label">Current Mode</span>
          <strong>Demo Data (API-off)</strong>
        </article>
      </section>

      <section className="cards-grid" aria-label="Value proposition">
        <Card>
          <h2>Who This Is For</h2>
          <ul>
            <li>Bettors who want fast pre-match scanning.</li>
            <li>Users who need structured confidence signals.</li>
            <li>Anyone comparing outcomes across leagues.</li>
          </ul>
        </Card>
        <Card>
          <h2>How It Helps</h2>
          <ul>
            <li>Ranked match cards with confidence score.</li>
            <li>Filter and sort controls for focus.</li>
            <li>Detailed match page with odds and timeline.</li>
          </ul>
        </Card>
        <Card>
          <h2>Example Insight</h2>
          <p className="price">Leverkusen vs Mainz</p>
          <p className="muted">
            High confidence home trend with strong recent form and early live momentum.
          </p>
        </Card>
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
