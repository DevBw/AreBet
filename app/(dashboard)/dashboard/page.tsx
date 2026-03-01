"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SelectField } from "@/components/ui/select-field";
import { SkeletonList } from "@/components/ui/skeleton";
import { TextInput } from "@/components/ui/text-input";
import { PageHeader } from "@/components/layout/page-header";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { useMatchFeed } from "@/lib/hooks/use-match-feed";
import { usePreferences } from "@/lib/hooks/use-preferences";
import { rankMatches } from "@/lib/utils/rank-matches";
import { formatTime } from "@/lib/utils/time";
import type { MatchStatus } from "@/types/match";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState<MatchStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"confidence" | "kickoff">("confidence");
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { feed, matches, loading, error, reload } = useMatchFeed();
  const { preferences, loading: prefsLoading } = usePreferences();

  // Apply stored preferences as initial defaults (once, after prefs finish loading)
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current || prefsLoading) return;
    initializedRef.current = true;
    const mapped = preferences.default_filter_status.toUpperCase();
    setStatusFilter(mapped === "ALL" || mapped === "LIVE" || mapped === "UPCOMING" || mapped === "FINISHED" ? mapped as MatchStatus | "ALL" : "ALL");
    setSortBy(preferences.default_sort === "kickoff" ? "kickoff" : "confidence");
  }, [preferences, prefsLoading]);

  const filteredMatches = useMemo(() => {
    const data = matches.filter((match) => {
      const inSearch = `${match.home.name} ${match.away.name} ${match.league}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const inStatus = statusFilter === "ALL" || match.status === statusFilter;
      return inSearch && inStatus;
    });

    return rankMatches({
      matches: data,
      favorites,
      sortKey: sortBy,
      favoritesFirst: preferences.show_favorites_first,
      hideFinished: preferences.hide_finished,
    });
  }, [matches, query, statusFilter, sortBy, favorites, preferences]);

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

      {loading ? <SkeletonList rows={3} /> : null}

      {!loading && error ? (
        <ErrorState
          title="Could not load data"
          description={error}
          retry={reload}
        />
      ) : null}

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
