"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { useMatchFeed } from "@/lib/hooks/use-match-feed";
import { formatTime } from "@/lib/utils/time";

export function HomeBoard() {
  const { feed, matches, loading, error } = useMatchFeed({ pollIntervalMs: 60000 });
  const live = matches.filter((m) => m.status === "LIVE").length;
  const upcoming = matches.filter((m) => m.status === "UPCOMING").length;
  const topConfidence = matches.length ? Math.max(...matches.map((m) => m.prediction.confidence)) : 0;
  const topPicks = useMemo(
    () =>
      [...matches]
        .sort((a, b) => b.prediction.confidence - a.prediction.confidence)
        .slice(0, 4),
    [matches]
  );

  return (
    <main className="page-wrap">
      <PageHeader
        title="Match Intelligence, Simplified"
        subtitle="See live matches, confidence signals, and quick context in one glance."
        meta={[
          `Last updated: ${formatTime(feed?.updatedAtISO)}`,
        ]}
        actions={
          <>
            <Link className="btn btn-primary" href="/dashboard">
              Open live board
            </Link>
            <Link className="btn btn-muted" href="/dashboard/insights">
              See insights
            </Link>
          </>
        }
      />
      {error ? <p className="muted">Update issue: {error}</p> : null}

      <section className="kpi-strip" aria-label="Board KPIs">
        <article className="kpi">
          <span className="kpi-label">Live Matches</span>
          <strong>{live}</strong>
        </article>
        <article className="kpi">
          <span className="kpi-label">Upcoming</span>
          <strong>{upcoming}</strong>
        </article>
        <article className="kpi">
          <span className="kpi-label">Top Confidence</span>
          <strong>{topConfidence}%</strong>
        </article>
      </section>

      {loading ? (
        <section className="cards-grid" aria-label="Loading matches">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="match-card">
              <Skeleton className="skeleton-line w-40" />
              <Skeleton className="skeleton-line w-full" />
              <Skeleton className="skeleton-line w-28" />
              <Skeleton className="skeleton-line w-20" />
            </Card>
          ))}
        </section>
      ) : topPicks.length === 0 ? (
        <EmptyState title="No matches available" description="Match data is not available right now. Check back shortly." />
      ) : (
        <section className="cards-grid" aria-label="Top opportunities">
          {topPicks.map((match) => (
            <Card className="match-card" key={match.id}>
              <div className="match-row">
                <p className="match-league">
                  {match.league} | {match.country}
                </p>
                <Badge tone={match.status.toLowerCase() as "live" | "upcoming" | "finished"}>
                  {match.status === "LIVE" && match.minute ? `LIVE ${match.minute}'` : match.status}
                </Badge>
              </div>
              <h2>
                {match.home.name} vs {match.away.name}
              </h2>
              <div className="match-row">
                <strong className="score">
                  {match.score.home}-{match.score.away}
                </strong>
                <span className="confidence">{match.prediction.confidence}% confidence</span>
              </div>
              <p className="match-advice">{match.prediction.advice}</p>
              <p className="muted">Kickoff: {formatTime(match.kickoffISO)}</p>
              <Link href={`/dashboard/match/${match.id}`} className="detail-link">
                View match detail
              </Link>
            </Card>
          ))}
        </section>
      )}

      <section className="quick-links" aria-label="Board actions">
        <Link href="/dashboard">Full dashboard</Link>
        <Link href="/dashboard?status=LIVE">Live only</Link>
        <Link href="/widgets">Football hub</Link>
      </section>
    </main>
  );
}
