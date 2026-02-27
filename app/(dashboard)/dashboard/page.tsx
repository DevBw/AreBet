"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { TextInput } from "@/components/ui/text-input";
import { PageHeader } from "@/components/layout/page-header";
import { listMatches } from "@/lib/services/matches";
import type { Match, MatchFeed, MatchStatus } from "@/types/match";

const FAVORITES_KEY = "arebet.favorites";

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MatchStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"confidence" | "kickoff">("confidence");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feed, setFeed] = useState<MatchFeed | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as number[];
      setFavorites(new Set(parsed));
    }
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listMatches();
        setFeed(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load matches.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const matches = feed?.matches ?? [];

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

  function toggleFavorite(matchId: number) {
    const next = new Set(favorites);
    if (next.has(matchId)) next.delete(matchId);
    else next.add(matchId);
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(next)));
  }

  function kickoffTime(match: Match) {
    return new Date(match.kickoffISO).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <main className="page-wrap">
      <PageHeader
        title="Live Match Dashboard"
        subtitle="Filter, sort, and track the games that matter right now."
        meta={[
          "Data: Live-style feed",
          `Last updated: ${feed ? new Date(feed.updatedAtISO).toLocaleTimeString() : "--:--"}`,
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
                  className={`favorite-btn ${favorites.has(match.id) ? "is-favorite" : ""}`}
                  onClick={() => toggleFavorite(match.id)}
                  aria-pressed={favorites.has(match.id)}
                  title={favorites.has(match.id) ? "Remove favorite" : "Add favorite"}
                >
                  {favorites.has(match.id) ? "Favored" : "Favorite"}
                </Button>
              </div>
              <h2>
                {match.home.name} vs {match.away.name}
              </h2>
              <p className="match-meta">
                <Badge tone={match.status.toLowerCase() as "live" | "upcoming" | "finished"}>
                  {match.status === "LIVE" && match.minute ? `LIVE ${match.minute}'` : match.status}
                </Badge>
                <span>Kickoff: {kickoffTime(match)}</span>
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
