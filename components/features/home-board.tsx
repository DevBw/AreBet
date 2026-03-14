"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonCommandCenter } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { MatchInsightPanel } from "@/components/features/match-insight-panel";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { useMatchFeed } from "@/lib/hooks/use-match-feed";
import { usePreferences } from "@/lib/hooks/use-preferences";
import { rankMatches } from "@/lib/utils/rank-matches";
import { useToast } from "@/components/ui/toast";
import { useMatchRatings } from "@/lib/hooks/use-match-ratings";
import {
  readLastLeague,
  writeLastLeague,
  readLastQuickFilter,
  writeLastQuickFilter,
  type QuickFilter,
} from "@/lib/storage/ui-state";
import { statusLabel, statusTone, confTier } from "@/lib/utils/match-status";
import { formatTime } from "@/lib/utils/time";
import type { Match } from "@/types/match";

const SOON_WINDOW_MS = 90 * 60 * 1000; // 90 minutes

function isStartingSoon(match: Match): boolean {
  if (match.status !== "UPCOMING") return false;
  const diff = new Date(match.kickoffISO).getTime() - Date.now();
  return diff >= 0 && diff <= SOON_WINDOW_MS;
}

const FILTER_LABELS: Record<QuickFilter, string> = {
  all: "All",
  live: "Live",
  soon: "Starting Soon",
  favorites: "Favorites",
  "high-conf": "High Confidence",
};

/** Derive a market movement indicator from marketHistory (placeholder). */
function marketMovement(match: Match): "up" | "down" | "stable" {
  if (!match.marketHistory || match.marketHistory.length < 2) return "stable";
  const first = match.marketHistory[0].home;
  const last = match.marketHistory[match.marketHistory.length - 1].home;
  if (last < first - 0.05) return "up"; // odds shortened = confidence up
  if (last > first + 0.05) return "down";
  return "stable";
}

export function HomeBoard() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(() => readLastQuickFilter());
  const [sortBy, setSortBy] = useState<"confidence" | "kickoff">("confidence");
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(() => {
    const p = searchParams.get("matchId");
    return p ? Number(p) || null : null;
  });
  const [insightOpen, setInsightOpen] = useState(() => !!searchParams.get("matchId"));

  const { addToast } = useToast();
  const { getRating } = useMatchRatings();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { feed, matches, loading, error, reload } = useMatchFeed({ pollIntervalMs: 60000 });
  const { preferences, loading: prefsLoading } = usePreferences();

  // Apply stored preferences once after loading
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current || prefsLoading) return;
    initRef.current = true;
    // Map preference default status to quick filter (only if no saved quick filter)
    const saved = readLastQuickFilter();
    if (saved === "all") {
      const s = preferences.default_filter_status.toUpperCase();
      if (s === "LIVE") setQuickFilter("live");
    }
    setSortBy(preferences.default_sort === "kickoff" ? "kickoff" : "confidence");
  }, [preferences, prefsLoading]);

  // Toast detection — compare previous feed vs new feed on each poll
  const prevMatchesRef = useRef<typeof matches>([]);
  const demoToastFiredRef = useRef(false);
  useEffect(() => {
    const prev = prevMatchesRef.current;

    if (!prev.length && matches.length) {
      // Initial load — fire a single demo toast after a short delay (dev + prod demo)
      if (!demoToastFiredRef.current) {
        demoToastFiredRef.current = true;
        const liveMatch = matches.find((m) => m.status === "LIVE");
        if (liveMatch) {
          setTimeout(() => {
            addToast(
              `${liveMatch.home.short} ${liveMatch.score.home}\u2013${liveMatch.score.away} ${liveMatch.away.short} \u00B7 ${liveMatch.minute}\u2019 (live now)`,
              "goal"
            );
          }, 1800);
        }
      }
      prevMatchesRef.current = matches;
      return;
    }

    // Subsequent polls — detect real changes
    for (const match of matches) {
      const old = prev.find((m) => m.id === match.id);
      if (!old) continue;

      // Goal scored
      if (
        match.score.home !== old.score.home ||
        match.score.away !== old.score.away
      ) {
        addToast(
          `Goal! ${match.home.short} ${match.score.home}\u2013${match.score.away} ${match.away.short}${match.minute ? ` \u00B7 ${match.minute}\u2019` : ""}`,
          "goal"
        );
      }

      // Match kicked off
      if (old.status === "UPCOMING" && match.status === "LIVE") {
        addToast(
          `Kicked off: ${match.home.name} vs ${match.away.name}`,
          "kickoff"
        );
      }

      // Full time
      if (old.status === "LIVE" && match.status === "FINISHED") {
        addToast(
          `Full time: ${match.home.short} ${match.score.home}\u2013${match.score.away} ${match.away.short}`,
          "finished"
        );
      }
    }

    prevMatchesRef.current = matches;
  }, [matches, addToast]);

  // Restore last league
  useEffect(() => {
    if (!matches.length) return;
    const saved = readLastLeague();
    if (saved && matches.some((m) => m.league === saved)) setSelectedLeague(saved);
  }, [matches]);

  // Leagues — sorted with favorites pinned at top when preference enabled
  const leagues = useMemo(() => {
    const map = new Map<string, { league: string; country: string }>();
    matches.forEach((m) => {
      if (!map.has(m.league)) map.set(m.league, { league: m.league, country: m.country });
    });
    const all = Array.from(map.values());
    if (!preferences.show_favorites_first) return { pinned: [] as typeof all, rest: all };
    const pinned = all.filter((l) => isFavorite("league", l.league));
    const rest = all.filter((l) => !isFavorite("league", l.league));
    return { pinned, rest };
  }, [matches, favorites, preferences.show_favorites_first, isFavorite]);

  // Favorite team/league sets for quick lookup
  const favTeamNames = useMemo(() => {
    const set = new Set<string>();
    favorites
      .filter((f) => f.entity_type === "team")
      .forEach((f) => set.add(f.label.toLowerCase()));
    return set;
  }, [favorites]);

  const favLeagueIds = useMemo(() => {
    const set = new Set<string>();
    favorites
      .filter((f) => f.entity_type === "league")
      .forEach((f) => set.add(f.entity_id));
    return set;
  }, [favorites]);

  // Quick filter logic
  function passesQuickFilter(m: Match): boolean {
    switch (quickFilter) {
      case "live":
        return m.status === "LIVE";
      case "soon":
        return isStartingSoon(m);
      case "favorites": {
        const homeL = m.home.name.toLowerCase();
        const awayL = m.away.name.toLowerCase();
        return (
          favTeamNames.has(homeL) ||
          favTeamNames.has(awayL) ||
          favLeagueIds.has(m.league) ||
          isFavorite("match", String(m.id))
        );
      }
      case "high-conf":
        return m.prediction.confidence >= 70;
      default:
        return true;
    }
  }

  // Filtered + ranked matches
  const filteredMatches = useMemo(() => {
    const data = matches.filter((m) => {
      const inSearch = `${m.home.name} ${m.away.name} ${m.league}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const inFilter = passesQuickFilter(m);
      const inLeague = !selectedLeague || m.league === selectedLeague;
      return inSearch && inFilter && inLeague;
    });
    return rankMatches({
      matches: data,
      favorites,
      sortKey: sortBy,
      favoritesFirst: preferences.show_favorites_first,
      hideFinished: preferences.hide_finished,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, query, quickFilter, sortBy, selectedLeague, favorites, preferences, favTeamNames, favLeagueIds]);

  // Active match — resolve from selection or default
  const activeMatchId = useMemo(() => {
    if (selectedMatchId != null && matches.some((m) => m.id === selectedMatchId)) {
      return selectedMatchId;
    }
    return (
      matches.find((m) => m.status === "LIVE")?.id ??
      matches.find((m) => m.status === "UPCOMING")?.id ??
      matches[0]?.id ??
      null
    );
  }, [selectedMatchId, matches]);

  const selectedMatch = useMemo(
    () => (activeMatchId != null ? matches.find((m) => m.id === activeMatchId) ?? null : null),
    [matches, activeMatchId]
  );

  // URL sync for matchId
  const selectMatch = useCallback((id: number) => {
    setSelectedMatchId(id);
    setInsightOpen(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("matchId", String(id));
      window.history.replaceState({}, "", url.toString());
    } catch {
      /* SSR guard */
    }
  }, []);

  const selectLeague = useCallback(
    (league: string) => {
      const next = selectedLeague === league ? "" : league;
      setSelectedLeague(next);
      if (next) {
        writeLastLeague(next);
        const first = matches.find((m) => m.league === next);
        if (first) selectMatch(first.id);
      }
    },
    [selectedLeague, matches, selectMatch]
  );

  // KPIs
  const kpis = useMemo(() => {
    const live = matches.filter((m) => m.status === "LIVE").length;
    const upcoming = matches.filter((m) => m.status === "UPCOMING").length;
    const top = matches.length
      ? Math.max(...matches.map((m) => m.prediction.confidence))
      : 0;
    return { live, upcoming, top };
  }, [matches]);

  const toggleSelectedMatchFav = useCallback(() => {
    if (!selectedMatch) return;
    toggleFavorite({
      entityType: "match",
      entityId: String(selectedMatch.id),
      label: `${selectedMatch.home.name} vs ${selectedMatch.away.name}`,
    });
  }, [selectedMatch, toggleFavorite]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <main className="page-wrap">
      <PageHeader
        title="Command Center"
        subtitle="Your live match workspace — filter, analyze, decide."
        meta={[
          ...(isDev ? ["Data: Demo feed"] : []),
          `Updated: ${formatTime(feed?.updatedAtISO)}`,
        ]}
        actions={
          <Link className="btn btn-primary" href="/insights">
            Insights
          </Link>
        }
      />

      <section className="kpi-strip" aria-label="KPIs">
        <article className="kpi">
          <span className="kpi-label">Live</span>
          <strong>{kpis.live}</strong>
        </article>
        <article className="kpi">
          <span className="kpi-label">Upcoming</span>
          <strong>{kpis.upcoming}</strong>
        </article>
        <article className="kpi">
          <span className="kpi-label">Top Confidence</span>
          <strong className={`conf-heat conf-heat--${confTier(kpis.top)}`}>{kpis.top}%</strong>
        </article>
      </section>

      {loading && <SkeletonCommandCenter />}

      {!loading && error && (
        <ErrorState title="Could not load data" description={error} retry={reload} />
      )}

      {!loading && !error && (
        <>
          <section className="cc-workspace">
            {/* Left — Leagues */}
            <aside className="cc-col cc-leagues">
              <div className="cc-col-header">
                <h3 className="cc-col-title">Leagues</h3>
              </div>
              <div className="cc-league-list">
                <button
                  type="button"
                  className={`cc-league-btn${!selectedLeague ? " is-active" : ""}`}
                  onClick={() => setSelectedLeague("")}
                >
                  All Leagues
                </button>
                {leagues.pinned.length > 0 && (
                  <span className="cc-league-section">Favorites</span>
                )}
                {leagues.pinned.map((l) => (
                  <div key={l.league} className="cc-league-row">
                    <button
                      type="button"
                      className={`cc-league-btn${l.league === selectedLeague ? " is-active" : ""}`}
                      onClick={() => selectLeague(l.league)}
                    >
                      <span>{l.league}</span>
                      <span className="cc-league-country">{l.country}</span>
                    </button>
                    <button
                      type="button"
                      className="cc-league-fav is-pinned"
                      onClick={() =>
                        toggleFavorite({
                          entityType: "league",
                          entityId: l.league,
                          label: l.league,
                        })
                      }
                      title="Unpin league"
                      aria-label={`Unpin ${l.league}`}
                    >
                      &#9733;
                    </button>
                  </div>
                ))}
                {leagues.pinned.length > 0 && leagues.rest.length > 0 && (
                  <span className="cc-league-section">All</span>
                )}
                {leagues.rest.map((l) => (
                  <div key={l.league} className="cc-league-row">
                    <button
                      type="button"
                      className={`cc-league-btn${l.league === selectedLeague ? " is-active" : ""}`}
                      onClick={() => selectLeague(l.league)}
                    >
                      <span>{l.league}</span>
                      <span className="cc-league-country">{l.country}</span>
                    </button>
                    <button
                      type="button"
                      className="cc-league-fav"
                      onClick={() =>
                        toggleFavorite({
                          entityType: "league",
                          entityId: l.league,
                          label: l.league,
                        })
                      }
                      title="Pin league"
                      aria-label={`Pin ${l.league}`}
                    >
                      &#9734;
                    </button>
                  </div>
                ))}
              </div>
            </aside>

            {/* Center — Matches */}
            <section className="cc-col cc-matches">
              <div className="cc-col-header">
                <h3 className="cc-col-title">
                  Matches{selectedLeague ? ` \u2014 ${selectedLeague}` : ""}
                </h3>
                <span className="widget-pill">{filteredMatches.length}</span>
              </div>

              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teams or leagues\u2026"
                aria-label="Search teams or leagues"
              />

              <div className="cc-filter-row">
                {(Object.keys(FILTER_LABELS) as QuickFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`cc-filter-pill${quickFilter === f ? " is-active" : ""}`}
                    onClick={() => {
                      setQuickFilter(f);
                      writeLastQuickFilter(f);
                    }}
                  >
                    {FILTER_LABELS[f]}
                  </button>
                ))}
                <span className="cc-sort-sep" />
                <button
                  type="button"
                  className={`cc-filter-pill${sortBy === "confidence" ? " is-active" : ""}`}
                  onClick={() => setSortBy("confidence")}
                >
                  Confidence
                </button>
                <button
                  type="button"
                  className={`cc-filter-pill${sortBy === "kickoff" ? " is-active" : ""}`}
                  onClick={() => setSortBy("kickoff")}
                >
                  Kickoff
                </button>
              </div>

              <div className="cc-match-list">
                {filteredMatches.map((match) => {
                  const sel = match.id === activeMatchId;
                  const movement = marketMovement(match);
                  return (
                    <button
                      key={match.id}
                      type="button"
                      className={`cc-match-row${sel ? " is-selected" : ""}${match.status === "LIVE" ? " is-live" : ""}`}
                      onClick={() => selectMatch(match.id)}
                      aria-pressed={sel}
                    >
                      <div className="cc-match-top">
                        <span className="cc-match-teams">
                          {match.home.short} vs {match.away.short}
                        </span>
                        <Badge tone={statusTone(match)}>
                          {statusLabel(match)}
                        </Badge>
                      </div>
                      <div className="cc-match-bottom">
                        <span className="cc-match-score">
                          {match.score.home}-{match.score.away}
                        </span>
                        <span className={`conf-heat conf-heat--${confTier(match.prediction.confidence)}`}>
                          {match.prediction.confidence}%
                        </span>
                        {isFavorite("match", String(match.id)) && (
                          <span className="cc-match-fav">&#9733;</span>
                        )}
                        {getRating(match.id) > 0 && (
                          <span className="cc-match-rating" title={`Your rating: ${getRating(match.id)}/5`}>
                            &#9733;{getRating(match.id)}
                          </span>
                        )}
                      </div>
                      <div className="cc-signals">
                        <span className="cc-signal cc-signal-form" title={`Home form: ${match.home.form.recent}`}>
                          {match.home.form.recent.split("").map((ch, i) => {
                            const k = ch.toUpperCase();
                            return (
                              <span
                                key={i}
                                className={`form-block form-block--sm ${k === "W" ? "form-block--win" : k === "L" ? "form-block--loss" : "form-block--draw"}`}
                              />
                            );
                          })}
                        </span>
                        <span className={`cc-signal cc-signal-market cc-signal-market--${movement}`}>
                          {movement === "up" ? "\u2191" : movement === "down" ? "\u2193" : "\u2194"}
                        </span>
                        {match.events.length > 0 && (
                          <span className="cc-signal cc-signal-news" title="Match events">
                            &#9888;
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {!filteredMatches.length && (
                <EmptyState
                  title="No matches found"
                  description="Adjust filters or search to see matches."
                />
              )}
            </section>

            {/* Right — Insight Panel */}
            <aside className={`cc-col cc-insight${insightOpen ? " is-open" : ""}`}>
              <MatchInsightPanel
                match={selectedMatch}
                isFavorite={
                  selectedMatch ? isFavorite("match", String(selectedMatch.id)) : false
                }
                onToggleFavorite={toggleSelectedMatchFav}
              />
            </aside>
          </section>

          {/* Mobile insight toggle */}
          <button
            type="button"
            className="cc-insight-toggle"
            onClick={() => setInsightOpen(!insightOpen)}
            aria-expanded={insightOpen}
          >
            {insightOpen
              ? "Hide Match Details"
              : selectedMatch
                ? `View ${selectedMatch.home.short} vs ${selectedMatch.away.short} Details`
                : "Match Details"}
          </button>
        </>
      )}

      <section className="quick-links" aria-label="Quick links">
        <Link href="/insights">Insights</Link>
        <Link href="/live-matches">Live matches</Link>
        <Link href="/upcoming-matches">Upcoming</Link>
        <Link href="/predictions">Predictions</Link>
        <Link href="/odds-comparison">Odds</Link>
        <Link href="/standings">Standings</Link>
        <Link href="/teams">Teams</Link>
        <Link href="/favorites">Favorites</Link>
      </section>
    </main>
  );
}
