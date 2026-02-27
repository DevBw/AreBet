"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { listMatches } from "@/lib/services/matches";
import type { Match, MatchFeed } from "@/types/match";

function kickoffTime(match: Match) {
  return new Date(match.kickoffISO).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatUpdatedAt(value?: string) {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function HomeBoard() {
  const [feed, setFeed] = useState<MatchFeed | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    async function load() {
      try {
        const data = await listMatches();
        setFeed(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load matches.");
      }
    }

    load();
    timer = setInterval(load, 60000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const matches = feed?.matches ?? [];
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
          "Data: Live-style feed",
          `Last updated: ${formatUpdatedAt(feed?.updatedAtISO)}`,
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

      <section aria-label="Brand mood board">
        <Card title="Brand Mood Board">
          <p className="muted">Core palette derived from the AreBet logo.</p>
          <div className="mood-grid">
            <div className="mood-swatch" data-tone="white">
              White
            </div>
            <div className="mood-swatch" data-tone="neon">
              Neon Green
            </div>
            <div className="mood-swatch" data-tone="emerald">
              Emerald
            </div>
            <div className="mood-swatch" data-tone="navy">
              Navy
            </div>
            <div className="mood-swatch" data-tone="deep">
              Deep Night
            </div>
            <div className="mood-swatch" data-tone="slate">
              Slate Blue
            </div>
          </div>
        </Card>
      </section>

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
            <p className="muted">Kickoff: {kickoffTime(match)}</p>
            <Link href={`/dashboard/match/${match.id}`} className="detail-link">
              View match detail
            </Link>
          </Card>
        ))}
      </section>

      <section className="quick-links" aria-label="Board actions">
        <Link href="/dashboard">Full dashboard</Link>
        <Link href="/dashboard?status=LIVE">Live only</Link>
        <Link href="/widgets">Football hub</Link>
      </section>
    </main>
  );
}
