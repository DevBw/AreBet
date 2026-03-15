"use client";

import { useState } from "react";
import { Sparkline } from "@/components/ui/sparkline";
import { getSparklineData } from "@/lib/demo/odds-history";
import { confTier, statusLabel, statusTone } from "@/lib/utils/match-status";
import { formatTime } from "@/lib/utils/time";
import type { Match } from "@/types/match";

type Tab = "overview" | "stats" | "timeline" | "h2h" | "odds";

const TAB_LABELS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview"  },
  { id: "stats",     label: "Live Stats" },
  { id: "timeline",  label: "Timeline"  },
  { id: "h2h",       label: "H2H"       },
  { id: "odds",      label: "Odds"      },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const FORM_COLOR: Record<string, string> = {
  W: "form-block--win",
  D: "form-block--draw",
  L: "form-block--loss",
};

function FormGuide({ form, label }: { form: string; label: string }) {
  return (
    <div className="md-form-row">
      <span className="md-form-team">{label}</span>
      <span className="form-guide">
        {form.split("").map((ch, i) => {
          const k = ch.toUpperCase();
          return (
            <span
              key={i}
              className={`form-block ${FORM_COLOR[k] ?? "form-block--draw"}`}
              title={k === "W" ? "Win" : k === "L" ? "Loss" : "Draw"}
            >
              {k}
            </span>
          );
        })}
      </span>
    </div>
  );
}

function StatBar({
  label,
  homeVal,
  awayVal,
  homeLabel,
  awayLabel,
  isPercent = false,
}: {
  label: string;
  homeVal: number;
  awayVal: number;
  homeLabel?: string;
  awayLabel?: string;
  isPercent?: boolean;
}) {
  const total = isPercent ? 100 : (homeVal + awayVal) || 1;
  const homePct = Math.round((homeVal / total) * 100);
  return (
    <div className="md-stat-bar">
      <div className="md-stat-bar-labels">
        <span className="md-stat-home">
          {homeLabel ?? homeVal}{isPercent ? "%" : ""}
        </span>
        <span className="md-stat-name">{label}</span>
        <span className="md-stat-away">
          {awayLabel ?? awayVal}{isPercent ? "%" : ""}
        </span>
      </div>
      <div className="md-stat-bar-track">
        <div className="md-stat-bar-home" style={{ width: `${homePct}%` }} />
        <div className="md-stat-bar-away" style={{ width: `${100 - homePct}%` }} />
      </div>
    </div>
  );
}

const EVENT_ICON: Record<string, string> = {
  Goal: "⚽",
  Card: "🟨",
  Substitution: "↔",
};

function cardIcon(detail: string) {
  return detail.toLowerCase().includes("red") ? "🟥" : "🟨";
}

// ── Tab panels ───────────────────────────────────────────────────────────────

function OverviewTab({ match }: { match: Match }) {
  const tone = statusTone(match);
  const tier = confTier(match.prediction.confidence);

  return (
    <div className="md-tab-panel">
      {/* Score hero */}
      <div className="md-score-hero">
        <div className="md-score-team md-score-team--home">
          <span className="md-team-name">{match.home.name}</span>
          <span className="md-team-abbr">{match.home.short}</span>
        </div>
        <div className="md-score-centre">
          <div className="md-score-digits">
            {match.score.home} – {match.score.away}
          </div>
          <span className={`md-status-badge md-status-badge--${tone}`}>
            {match.status === "LIVE" && match.minute
              ? `${match.minute}'`
              : statusLabel(match)}
          </span>
          <span className="md-kickoff-time">{formatTime(match.kickoffISO)}</span>
        </div>
        <div className="md-score-team md-score-team--away">
          <span className="md-team-name">{match.away.name}</span>
          <span className="md-team-abbr">{match.away.short}</span>
        </div>
      </div>

      {/* Venue */}
      <p className="md-venue">
        📍 {match.venue} · {match.league} · {match.country}
      </p>

      {/* Prediction */}
      <div className="md-prediction-card">
        <div className="md-prediction-conf">
          <span className={`conf-heat insight-conf-heat conf-heat--${tier}`}>
            {match.prediction.confidence}%
          </span>
          <span className="md-prediction-label">confidence</span>
        </div>
        <div className="md-prediction-details">
          <span className="md-prediction-advice">{match.prediction.advice}</span>
          <span className="md-prediction-xg">
            xG: {match.prediction.expectedGoals.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Form guides */}
      <div className="md-section">
        <h4 className="md-section-label">Recent Form</h4>
        <FormGuide form={match.home.form.recent} label={match.home.short} />
        <FormGuide form={match.away.form.recent} label={match.away.short} />
      </div>
    </div>
  );
}

function StatsTab({ match }: { match: Match }) {
  if (!match.stats) {
    return (
      <div className="md-tab-panel md-empty">
        Stats not available for this match yet.
      </div>
    );
  }
  const s = match.stats;
  return (
    <div className="md-tab-panel">
      <div className="md-stats-header">
        <span className="md-stats-team">{match.home.short}</span>
        <span className="md-stats-spacer" />
        <span className="md-stats-team md-stats-team--away">{match.away.short}</span>
      </div>
      <div className="md-stat-bars">
        <StatBar label="Possession" homeVal={s.possession.home} awayVal={s.possession.away} isPercent />
        <StatBar label="Shots" homeVal={s.shots.home} awayVal={s.shots.away} />
        <StatBar label="On Target" homeVal={s.shotsOnTarget.home} awayVal={s.shotsOnTarget.away} />
        <StatBar
          label="xG"
          homeVal={s.xg.home}
          awayVal={s.xg.away}
          homeLabel={s.xg.home.toFixed(1)}
          awayLabel={s.xg.away.toFixed(1)}
        />
        <StatBar label="Pass Acc." homeVal={s.passAccuracy.home} awayVal={s.passAccuracy.away} isPercent />
        <StatBar label="Corners" homeVal={s.corners.home} awayVal={s.corners.away} />
      </div>
    </div>
  );
}

function TimelineTab({ match }: { match: Match }) {
  if (!match.events.length) {
    return (
      <div className="md-tab-panel md-empty">
        No match events yet.
      </div>
    );
  }
  return (
    <div className="md-tab-panel">
      <div className="md-timeline">
        {match.events.map((ev, i) => {
          const isHome = ev.team === match.home.name;
          const icon =
            ev.type === "Card"
              ? cardIcon(ev.detail)
              : (EVENT_ICON[ev.type] ?? "•");
          const isGoal = ev.type === "Goal";
          return (
            <div
              key={`${ev.minute}-${ev.player}-${i}`}
              className={`md-tl-row${isHome ? " md-tl-row--home" : " md-tl-row--away"}`}
            >
              {isHome ? (
                <>
                  <div className={`md-tl-content${isGoal ? " md-tl-content--goal" : ""}`}>
                    <span className="md-tl-player">{ev.player}</span>
                    <span className="md-tl-detail">{ev.detail}</span>
                  </div>
                  <div className="md-tl-pin">
                    <span className="md-tl-icon">{icon}</span>
                    <span className="md-tl-minute">{ev.minute}'</span>
                  </div>
                  <div className="md-tl-spacer" />
                </>
              ) : (
                <>
                  <div className="md-tl-spacer" />
                  <div className="md-tl-pin">
                    <span className="md-tl-minute">{ev.minute}'</span>
                    <span className="md-tl-icon">{icon}</span>
                  </div>
                  <div className={`md-tl-content md-tl-content--right${isGoal ? " md-tl-content--goal" : ""}`}>
                    <span className="md-tl-player">{ev.player}</span>
                    <span className="md-tl-detail">{ev.detail}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function H2HTab({ match }: { match: Match }) {
  return (
    <div className="md-tab-panel">
      {match.h2h && match.h2h.length > 0 ? (
        <div className="md-section">
          <h4 className="md-section-label">Last {match.h2h.length} Meetings</h4>
          <div className="md-h2h-list">
            {match.h2h.map((g, i) => {
              const homeWin = g.homeScore > g.awayScore;
              const awayWin = g.awayScore > g.homeScore;
              return (
                <div key={i} className="md-h2h-row">
                  <span className="md-h2h-date">{g.date}</span>
                  <div className="md-h2h-match">
                    <span className={`md-h2h-team${homeWin ? " md-h2h-team--winner" : ""}`}>
                      {g.homeTeam}
                    </span>
                    <span className="md-h2h-score">
                      {g.homeScore}–{g.awayScore}
                    </span>
                    <span className={`md-h2h-team md-h2h-team--right${awayWin ? " md-h2h-team--winner" : ""}`}>
                      {g.awayTeam}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="md-empty">No H2H data available.</p>
      )}

      {match.playerRatings && (
        <div className="md-section">
          <h4 className="md-section-label">Player Ratings</h4>
          <div className="md-ratings-grid">
            <div className="md-ratings-col">
              <span className="md-ratings-team">{match.home.short}</span>
              {match.playerRatings.home.map((p) => (
                <div key={p.name} className="md-rating-row">
                  <span className="md-rating-pos">{p.position}</span>
                  <span className="md-rating-name">{p.name}</span>
                  <span className={`md-rating-val${p.rating >= 7.5 ? " is-high" : p.rating < 6.5 ? " is-low" : ""}`}>
                    {p.rating.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="md-ratings-col">
              <span className="md-ratings-team">{match.away.short}</span>
              {match.playerRatings.away.map((p) => (
                <div key={p.name} className="md-rating-row">
                  <span className="md-rating-pos">{p.position}</span>
                  <span className="md-rating-name">{p.name}</span>
                  <span className={`md-rating-val${p.rating >= 7.5 ? " is-high" : p.rating < 6.5 ? " is-low" : ""}`}>
                    {p.rating.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OddsTab({ match }: { match: Match }) {
  const markets = [
    { key: "home" as const,  label: `${match.home.short} Win`, value: match.odds.home  },
    { key: "draw" as const,  label: "Draw",                    value: match.odds.draw  },
    { key: "away" as const,  label: `${match.away.short} Win`, value: match.odds.away  },
    { key: "over25" as const, label: "Over 2.5",               value: match.odds.over25 },
    { key: "btts" as const,  label: "BTTS Yes",                value: match.odds.btts  },
  ];

  return (
    <div className="md-tab-panel">
      {/* Sparkline grid */}
      <div className="md-section">
        <h4 className="md-section-label">Odds Movement</h4>
        <div className="md-spark-grid">
          {markets.map(({ key, label, value }) => {
            const data = getSparklineData(match, key);
            const first = data[0];
            const last  = data[data.length - 1];
            const dir   = last < first - 0.02 ? "↓" : last > first + 0.02 ? "↑" : "→";
            const dirClass = last < first - 0.02 ? "is-short" : last > first + 0.02 ? "is-drift" : "is-flat";
            return (
              <div key={key} className="md-spark-card">
                <span className="md-spark-label">{label}</span>
                <Sparkline data={data} width={72} height={28} filled />
                <div className="md-spark-footer">
                  <span className="md-spark-odds">{value.toFixed(2)}</span>
                  <span className={`md-spark-dir ${dirClass}`}>{dir}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bookmaker comparison */}
      {match.bookmakerOdds.length > 0 && (
        <div className="md-section">
          <h4 className="md-section-label">Bookmaker Comparison</h4>
          <div className="md-bm-table-wrap">
            <table className="md-bm-table">
              <thead>
                <tr>
                  <th>Bookmaker</th>
                  <th>{match.home.short}</th>
                  <th>Draw</th>
                  <th>{match.away.short}</th>
                </tr>
              </thead>
              <tbody>
                {match.bookmakerOdds.map((bm) => (
                  <tr key={bm.bookmaker}>
                    <td className="md-bm-name">{bm.bookmaker}</td>
                    <td>{bm.home.toFixed(2)}</td>
                    <td>{bm.draw.toFixed(2)}</td>
                    <td>{bm.away.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export function MatchDetailTabs({ match }: { match: Match }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const availableTabs = TAB_LABELS.filter((t) => {
    if (t.id === "stats") return !!match.stats;
    if (t.id === "timeline") return match.events.length > 0;
    return true;
  });

  return (
    <div className="md-root">
      {/* Tab bar */}
      <div className="md-tab-bar" role="tablist">
        {availableTabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            className={`md-tab${activeTab === t.id ? " is-active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      {activeTab === "overview"  && <OverviewTab  match={match} />}
      {activeTab === "stats"     && <StatsTab     match={match} />}
      {activeTab === "timeline"  && <TimelineTab  match={match} />}
      {activeTab === "h2h"       && <H2HTab       match={match} />}
      {activeTab === "odds"      && <OddsTab      match={match} />}
    </div>
  );
}
