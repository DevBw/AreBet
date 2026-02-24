"use client";

import { useMemo, useState } from "react";
import type { Match } from "@/types/match";
import { Badge } from "@/components/ui/badge";

type WidgetsDemoProps = {
  matches: Match[];
  updatedAtISO: string;
};

type StandingRow = {
  rank: number;
  team: string;
  points: number;
  form: string;
};

const DEMO_STANDINGS: Record<string, StandingRow[]> = {
  "Premier League": [
    { rank: 1, team: "Arsenal", points: 61, form: "WWDWW" },
    { rank: 2, team: "Liverpool", points: 58, form: "WWWWW" },
    { rank: 3, team: "Man City", points: 56, form: "WDWWW" },
  ],
  "La Liga": [
    { rank: 1, team: "Barcelona", points: 57, form: "WWDWW" },
    { rank: 2, team: "Real Madrid", points: 55, form: "WWWDD" },
    { rank: 3, team: "Girona", points: 52, form: "WWLDW" },
  ],
  "Serie A": [
    { rank: 1, team: "Inter", points: 60, form: "WWWWW" },
    { rank: 2, team: "Milan", points: 54, form: "WWDWL" },
    { rank: 3, team: "Juventus", points: 53, form: "WDLWW" },
  ],
  Bundesliga: [
    { rank: 1, team: "Leverkusen", points: 62, form: "WWWWW" },
    { rank: 2, team: "Bayern", points: 57, form: "WWWDW" },
    { rank: 3, team: "Dortmund", points: 51, form: "WDLWW" },
  ],
  "Ligue 1": [
    { rank: 1, team: "PSG", points: 59, form: "WWWDW" },
    { rank: 2, team: "Monaco", points: 52, form: "WWDWL" },
    { rank: 3, team: "Nice", points: 50, form: "WWLDW" },
  ],
};

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function toStatusLabel(match: Match) {
  if (match.status === "LIVE" && match.minute) {
    return `LIVE ${match.minute}'`;
  }
  return match.status;
}

function pickPlayer(match: Match) {
  const firstEvent = match.events[0];
  if (firstEvent) return firstEvent.player;
  return `${match.home.name} captain`;
}

export function WidgetsDemo({ matches, updatedAtISO }: WidgetsDemoProps) {
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id ?? 0);

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === selectedMatchId) ?? matches[0],
    [matches, selectedMatchId]
  );

  const leagues = useMemo(() => {
    const map = new Map<string, { country: string; leagues: string[] }>();
    matches.forEach((match) => {
      const entry = map.get(match.country) ?? { country: match.country, leagues: [] };
      if (!entry.leagues.includes(match.league)) entry.leagues.push(match.league);
      map.set(match.country, entry);
    });
    return Array.from(map.values());
  }, [matches]);

  const leagueMatches = useMemo(() => {
    if (!selectedMatch) return [];
    return matches.filter((match) => match.league === selectedMatch.league);
  }, [matches, selectedMatch]);

  const standings = selectedMatch ? DEMO_STANDINGS[selectedMatch.league] ?? [] : [];

  if (!selectedMatch) return null;

  return (
    <section className="widgets-layout" aria-label="Widgets demo">
      <div className="widgets-column">
        <article className="widget-card">
          <div className="widget-title-row">
            <h3 className="widget-title">Games widget</h3>
            <span className="widget-pill">data-type="games"</span>
          </div>
          <p className="widget-meta">Auto-refresh every 30s in production. Demo feed updated: {new Date(updatedAtISO).toLocaleTimeString()}.</p>
          <div className="widget-list">
            {matches.map((match) => {
              const isActive = match.id === selectedMatchId;
              return (
                <button
                  key={match.id}
                  type="button"
                  className={`widget-row widget-button ${isActive ? "is-active" : ""}`}
                  onClick={() => setSelectedMatchId(match.id)}
                >
                  <span>
                    {match.home.short} vs {match.away.short}
                  </span>
                  <span className="widget-pill">{toStatusLabel(match)}</span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="widget-card">
          <div className="widget-title-row">
            <h3 className="widget-title">League widget</h3>
            <span className="widget-pill">data-type="league"</span>
          </div>
          <p className="widget-meta">
            Schedule for {selectedMatch.league}. Set `data-tab="games"` or `data-tab="results"` in production.
          </p>
          <div className="widget-list">
            {leagueMatches.map((match) => (
              <div key={match.id} className="widget-row">
                <span>
                  {match.home.short} vs {match.away.short}
                </span>
                <span className="widget-meta">{formatKickoff(match.kickoffISO)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="widget-card">
          <div className="widget-title-row">
            <h3 className="widget-title">Leagues widget</h3>
            <span className="widget-pill">data-type="leagues"</span>
          </div>
          <div className="widget-list">
            {leagues.map((entry) => (
              <div key={entry.country} className="widget-row">
                <span>{entry.country}</span>
                <span className="widget-meta">{entry.leagues.join(", ")}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="widget-card">
          <div className="widget-title-row">
            <h3 className="widget-title">Standings widget</h3>
            <span className="widget-pill">data-type="standings"</span>
          </div>
          {standings.length ? (
            <div className="widget-list">
              {standings.map((row) => (
                <div key={row.team} className="widget-row">
                  <span>
                    {row.rank}. {row.team}
                  </span>
                  <span className="widget-meta">{row.points} pts · {row.form}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="widget-meta">Standings demo not available for this league yet.</p>
          )}
        </article>
      </div>

      <div className="widgets-column">
        <article className="widget-card" id="details">
          <div className="widget-title-row">
            <h3 className="widget-title">Game widget</h3>
            <span className="widget-pill">data-type="game"</span>
          </div>
          <p className="widget-meta">
            Targeted from the Games widget using `data-target-game="#details"` in production.
          </p>
          <div className="widget-row">
            <strong>
              {selectedMatch.home.name} vs {selectedMatch.away.name}
            </strong>
            <Badge tone={selectedMatch.status.toLowerCase() as "live" | "upcoming" | "finished"}>
              {toStatusLabel(selectedMatch)}
            </Badge>
          </div>
          <p className="widget-meta">
            Venue: {selectedMatch.venue} · Kickoff {formatKickoff(selectedMatch.kickoffISO)}
          </p>
          <div className="widget-row">
            <span className="widget-pill">Score {selectedMatch.score.home}-{selectedMatch.score.away}</span>
            <span className="widget-meta">{selectedMatch.prediction.advice}</span>
          </div>
        </article>

        <article className="widget-card">
          <div className="widget-title-row">
            <h3 className="widget-title">Team widget</h3>
            <span className="widget-pill">data-type="team"</span>
          </div>
          <p className="widget-meta">
            Focused on {selectedMatch.home.name}. Tabs like `statistics` or `squads` can be enabled in production.
          </p>
          <div className="widget-list">
            <div className="widget-row">
              <span>Recent form</span>
              <span className="widget-meta">{selectedMatch.home.form.recent}</span>
            </div>
            <div className="widget-row">
              <span>Goals for</span>
              <span className="widget-meta">{selectedMatch.home.form.goalsFor}</span>
            </div>
            <div className="widget-row">
              <span>Goals against</span>
              <span className="widget-meta">{selectedMatch.home.form.goalsAgainst}</span>
            </div>
          </div>
        </article>

        <article className="widget-card">
          <div className="widget-title-row">
            <h3 className="widget-title">Player widget</h3>
            <span className="widget-pill">data-type="player"</span>
          </div>
          <p className="widget-meta">
            Demo focus: {pickPlayer(selectedMatch)}. Full profiles unlock with API player data.
          </p>
          <div className="widget-list">
            <div className="widget-row">
              <span>Season form</span>
              <span className="widget-meta">8 goals · 4 assists</span>
            </div>
            <div className="widget-row">
              <span>Fitness</span>
              <span className="widget-meta">Available</span>
            </div>
          </div>
        </article>

        <article className="widget-card">
          <div className="widget-title-row">
            <h3 className="widget-title">H2H widget</h3>
            <span className="widget-pill">data-type="h2h"</span>
          </div>
          <p className="widget-meta">Historical record for {selectedMatch.home.short} vs {selectedMatch.away.short}.</p>
          <div className="widget-list">
            <div className="widget-row">
              <span>Last meeting</span>
              <span className="widget-meta">{selectedMatch.home.short} 2-1 {selectedMatch.away.short}</span>
            </div>
            <div className="widget-row">
              <span>Previous</span>
              <span className="widget-meta">{selectedMatch.home.short} 1-1 {selectedMatch.away.short}</span>
            </div>
            <div className="widget-row">
              <span>Earlier</span>
              <span className="widget-meta">{selectedMatch.home.short} 0-1 {selectedMatch.away.short}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
