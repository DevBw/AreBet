"use client";

import { useEffect, useMemo, useState } from "react";
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

const LEAGUE_STANDINGS: Record<string, StandingRow[]> = {
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
  const [selectedLeague, setSelectedLeague] = useState(matches[0]?.league ?? "");
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id ?? 0);

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === selectedMatchId) ?? matches[0],
    [matches, selectedMatchId]
  );

  const leagues = useMemo(() => {
    const map = new Map<string, { league: string; country: string }>();
    matches.forEach((match) => {
      if (!map.has(match.league)) {
        map.set(match.league, { league: match.league, country: match.country });
      }
    });
    return Array.from(map.values());
  }, [matches]);

  const leagueMatches = useMemo(() => {
    if (!selectedLeague) return matches;
    return matches.filter((match) => match.league === selectedLeague);
  }, [matches, selectedLeague]);

  const standings = selectedLeague ? LEAGUE_STANDINGS[selectedLeague] ?? [] : [];

  useEffect(() => {
    if (!selectedLeague && leagues.length) {
      setSelectedLeague(leagues[0].league);
    }
  }, [leagues, selectedLeague]);

  useEffect(() => {
    if (!leagueMatches.length) return;
    const exists = leagueMatches.some((match) => match.id === selectedMatchId);
    if (!exists) setSelectedMatchId(leagueMatches[0].id);
  }, [leagueMatches, selectedMatchId]);

  if (!selectedMatch) return null;

  return (
    <section className="widgets-layout" aria-label="Widgets preview">
      <div className="widgets-col widgets-col-left">
        <article className="widget-card sticky-panel">
          <div className="widget-title-row">
            <h3 className="widget-title">Leagues</h3>
            <span className="widget-pill">Browse</span>
          </div>
          <div className="widget-list">
            {leagues.map((entry) => {
              const isActive = entry.league === selectedLeague;
              return (
                <button
                  key={entry.league}
                  type="button"
                  className={`widget-row widget-button ${isActive ? "is-active" : ""}`}
                  onClick={() => setSelectedLeague(entry.league)}
                >
                  <span>{entry.league}</span>
                  <span className="widget-meta">{entry.country}</span>
                </button>
              );
            })}
          </div>
        </article>
      </div>

      <div className="widgets-col widgets-col-center">
        <article className="widget-card">
          <div className="widget-title-row">
            <h3 className="widget-title">Matches</h3>
            <span className="widget-pill">Updated {new Date(updatedAtISO).toLocaleTimeString()}</span>
          </div>
          <p className="widget-meta">Showing {selectedLeague} games.</p>
          <div className="widget-list">
            {leagueMatches.map((match) => {
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
      </div>

      <div className="widgets-col widgets-col-right">
        <article className="widget-card">
          <div className="widget-title-row">
            <h3 className="widget-title">Standings</h3>
            <span className="widget-pill">Table</span>
          </div>
          {standings.length ? (
            <div className="widget-list">
              {standings.map((row) => (
                <div key={row.team} className="widget-row">
                  <span>
                    {row.rank}. {row.team}
                  </span>
                  <span className="widget-meta">{row.points} pts | {row.form}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="widget-meta">Standings not available for this league yet.</p>
          )}
        </article>

        <article className="widget-card sticky-panel" id="details">
          <div className="widget-title-row">
            <h3 className="widget-title">Match detail</h3>
            <span className="widget-pill">Overview</span>
          </div>
          <div className="widget-row">
            <strong>
              {selectedMatch.home.name} vs {selectedMatch.away.name}
            </strong>
            <Badge tone={selectedMatch.status.toLowerCase() as "live" | "upcoming" | "finished"}>
              {toStatusLabel(selectedMatch)}
            </Badge>
          </div>
          <p className="widget-meta">
            Venue: {selectedMatch.venue} | Kickoff {formatKickoff(selectedMatch.kickoffISO)}
          </p>
          <div className="widget-row">
            <span className="widget-pill">Score {selectedMatch.score.home}-{selectedMatch.score.away}</span>
            <span className="widget-meta">{selectedMatch.prediction.advice}</span>
          </div>
          <div className="widget-list">
            <div className="widget-row">
              <span>Team form</span>
              <span className="widget-meta">{selectedMatch.home.form.recent}</span>
            </div>
            <div className="widget-row">
              <span>Player to watch</span>
              <span className="widget-meta">{pickPlayer(selectedMatch)}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
