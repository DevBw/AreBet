"use client";

import { useMemo, useState } from "react";

type MatchStatus = "LIVE" | "UPCOMING" | "FINISHED";

type MatchItem = {
  id: number;
  league: string;
  home: string;
  away: string;
  status: MatchStatus;
  minute?: number;
  score: string;
  confidence: number;
  kickoff: string;
};

const MATCHES: MatchItem[] = [
  { id: 1, league: "Premier League", home: "Arsenal", away: "Brighton", status: "LIVE", minute: 63, score: "2-1", confidence: 76, kickoff: "19:45" },
  { id: 2, league: "La Liga", home: "Valencia", away: "Sevilla", status: "UPCOMING", score: "-", confidence: 64, kickoff: "20:00" },
  { id: 3, league: "Serie A", home: "Roma", away: "Torino", status: "FINISHED", score: "1-1", confidence: 58, kickoff: "17:30" },
  { id: 4, league: "Bundesliga", home: "Leverkusen", away: "Mainz", status: "LIVE", minute: 28, score: "1-0", confidence: 71, kickoff: "18:00" },
  { id: 5, league: "Ligue 1", home: "Lyon", away: "Nice", status: "UPCOMING", score: "-", confidence: 61, kickoff: "21:00" },
];

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MatchStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"confidence" | "kickoff">("confidence");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const filteredMatches = useMemo(() => {
    let data = MATCHES.filter((match) => {
      const inSearch = `${match.home} ${match.away} ${match.league}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const inStatus = statusFilter === "ALL" || match.status === statusFilter;
      return inSearch && inStatus;
    });

    data = [...data].sort((a, b) => {
      if (sortBy === "confidence") return b.confidence - a.confidence;
      return a.kickoff.localeCompare(b.kickoff);
    });
    return data;
  }, [query, statusFilter, sortBy]);

  const kpis = useMemo(() => {
    const live = MATCHES.filter((m) => m.status === "LIVE").length;
    const upcoming = MATCHES.filter((m) => m.status === "UPCOMING").length;
    const topConfidence = Math.max(...MATCHES.map((m) => m.confidence));
    return { live, upcoming, topConfidence };
  }, []);

  function toggleFavorite(matchId: number) {
    const next = new Set(favorites);
    if (next.has(matchId)) next.delete(matchId);
    else next.add(matchId);
    setFavorites(next);
  }

  return (
    <main className="page-wrap">
      <section className="dashboard-head">
        <h1>Match Dashboard</h1>
        <p>Filter and prioritize opportunities with local interactive controls.</p>
      </section>

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

      <section className="controls panel" aria-label="Dashboard controls">
        <label>
          Search teams/leagues
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try Arsenal or La Liga"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as MatchStatus | "ALL")}>
            <option value="ALL">All</option>
            <option value="LIVE">Live</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="FINISHED">Finished</option>
          </select>
        </label>
        <label>
          Sort by
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "confidence" | "kickoff")}>
            <option value="confidence">Confidence</option>
            <option value="kickoff">Kickoff Time</option>
          </select>
        </label>
      </section>

      <section className="cards-grid" aria-label="Match list">
        {filteredMatches.map((match) => (
          <article className="panel match-card" key={match.id}>
            <div className="match-row">
              <p className="match-league">{match.league}</p>
              <button
                type="button"
                className="favorite-btn"
                onClick={() => toggleFavorite(match.id)}
                aria-pressed={favorites.has(match.id)}
                title={favorites.has(match.id) ? "Remove favorite" : "Add favorite"}
              >
                {favorites.has(match.id) ? "Favored" : "Favorite"}
              </button>
            </div>
            <h2>
              {match.home} vs {match.away}
            </h2>
            <p className="match-meta">
              <span className={`badge badge-${match.status.toLowerCase()}`}>
                {match.status === "LIVE" && match.minute ? `LIVE ${match.minute}'` : match.status}
              </span>
              <span>Kickoff: {match.kickoff}</span>
            </p>
            <div className="match-row">
              <strong className="score">{match.score}</strong>
              <span className="confidence">{match.confidence}% confidence</span>
            </div>
          </article>
        ))}
      </section>

      {!filteredMatches.length && (
        <section className="panel">
          <p>No matches match your current filters.</p>
        </section>
      )}
    </main>
  );
}
