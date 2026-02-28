"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { TextInput } from "@/components/ui/text-input";
import { PageHeader } from "@/components/layout/page-header";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { useMatchFeed } from "@/lib/hooks/use-match-feed";
import { formatTime } from "@/lib/utils/time";
import type { MatchStatus } from "@/types/match";

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MatchStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"confidence" | "kickoff">("confidence");
  const { isFavorite, toggleFavorite } = useFavorites();
  const { feed, matches, loading, error } = useMatchFeed();

  const filteredMatches = useMemo(() => {
    let data = matches.filter((match) => {
      const inSearch = `${match.home.name} ${match.away.name} ${match.league}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const inStatus = statusFilter === "ALL" || match.status === statusFilter;
      return inSearch && inStatus;
    });

    data = [...data].sort((a, b) => {
      if (sortBy === "confidence") return b.prediction.confidence - a.prediction.confidence;
      return a.kickoffISO.localeCompare(b.kickoffISO);
    });
    return data;
  }, [matches, query, statusFilter, sortBy]);

  const kpis = useMemo(() => {
    const live = matches.filter((m) => m.status === "LIVE").length;
    const upcoming = matches.filter((m) => m.status === "UPCOMING").length;
    const topConfidence = matches.length ? Math.max(...matches.map((m) => m.prediction.confidence)) : 0;
    return { live, upcoming, topConfidence };
  }, [matches]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <main className="page-wrap">
      <PageHeader
        title="Live Match Dashboard"
        subtitle="Filter, sort, and track the games that matter right now."
        meta={[
          ...(isDev ? ["Data: Live-style feed"] : []),
          `Last updated: ${formatTime(feed?.updatedAtISO)}`,
        ]}
        actions={
          <>
            <Link className="btn btn-muted" href="/widgets">
              Football hub
            </Link>
            <Link className="btn btn-primary" href="/dashboard/insights">
              Insights
            </Link>
          </>
        }
      />

      <section className="kpi-strip" aria-label="Dashboard KPIs">
        <article className="kpi">
          <span className="kpi-label">Live Matches</span>
          <strong>{kpis.live}</strong>
        </article>
        <article className="kpi">
          <span className="kpi-label">Upcoming</span>
          <strong>{kpis.upcoming}</strong>
        </article>
        <article className="kpi">
          <span className="kpi-label">Top Confidence</span>
          <strong>{kpis.topConfidence}%</strong>
        </article>
      </section>

      <Card className="controls" title="Filters">
        <TextInput
          label="Search teams/leagues"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try Arsenal or La Liga"
        />
        <SelectField
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MatchStatus | "ALL")}
          options={[
            { label: "All", value: "ALL" },
            { label: "Live", value: "LIVE" },
            { label: "Upcoming", value: "UPCOMING" },
            { label: "Finished", value: "FINISHED" },
          ]}
        />
        <SelectField
          label="Sort by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "confidence" | "kickoff")}
          options={[
            { label: "Confidence", value: "confidence" },
            { label: "Kickoff Time", value: "kickoff" },
          ]}
        />
      </Card>

      {loading ? (
        <section className="cards-grid" aria-label="Loading matches">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="match-card">
              <Skeleton className="skeleton-line w-40" />
              <Skeleton className="skeleton-line w-full" />
              <Skeleton className="skeleton-line w-28" />
              <Skeleton className="skeleton-line w-20" />
            </Card>
          ))}
        </section>
      ) : null}

      {!loading && error ? <EmptyState title="Could not load data" description={`${error} You can continue browsing.`} /> : null}

      {!loading && !error ? (
        <section className="cards-grid" aria-label="Match list">
          {filteredMatches.map((match) => (
            <Card className="match-card" key={match.id}>
              <div className="match-row">
                <p className="match-league">
                  {match.league} | {match.country}
                </p>
                <Button
                  type="button"
                  variant="muted"
                  className={`favorite-btn ${isFavorite("match", String(match.id)) ? "is-favorite" : ""}`}
                  onClick={() =>
                    toggleFavorite({
                      entityType: "match",
                      entityId: String(match.id),
                      label: `${match.home.name} vs ${match.away.name}`,
                    })
                  }
                  aria-pressed={isFavorite("match", String(match.id))}
                  title={isFavorite("match", String(match.id)) ? "Remove favorite" : "Add favorite"}
                >
                  {isFavorite("match", String(match.id)) ? "Favored" : "Favorite"}
                </Button>
              </div>
              <h2>
                {match.home.name} vs {match.away.name}
              </h2>
              <p className="match-meta">
                <Badge tone={match.status.toLowerCase() as "live" | "upcoming" | "finished"}>
                  {match.status === "LIVE" && match.minute ? `LIVE ${match.minute}'` : match.status}
                </Badge>
                <span>Kickoff: {formatTime(match.kickoffISO)}</span>
              </p>
              <div className="match-row">
                <strong className="score">
                  {match.score.home}-{match.score.away}
                </strong>
                <span className="confidence">{match.prediction.confidence}% confidence</span>
              </div>
              <p className="match-advice">Insight: {match.prediction.advice}</p>
              <Link href={`/dashboard/match/${match.id}`} className="detail-link">
                View match detail
              </Link>
            </Card>
          ))}
        </section>
      ) : null}

      {!loading && !error && !filteredMatches.length ? (
        <EmptyState
          title="No matches found"
          description="No matches match your current filter and search selection. Try resetting controls."
        />
      ) : null}

      <section className="quick-links" aria-label="Insights actions">
        <Link href="/dashboard/insights">Open insights</Link>
        <Link href="/dashboard/live-matches">Live matches</Link>
        <Link href="/dashboard/upcoming-matches">Upcoming matches</Link>
        <Link href="/dashboard/predictions">Predictions</Link>
        <Link href="/dashboard/odds-comparison">Odds comparison</Link>
        <Link href="/dashboard/standings">Standings</Link>
        <Link href="/dashboard/teams">Teams</Link>
        <Link href="/dashboard/favorites">Favorites</Link>
      </section>
    </main>
  );
}
