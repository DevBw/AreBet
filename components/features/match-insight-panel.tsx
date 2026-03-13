"use client";

import Link from "next/link";
import type { Match, MatchStats } from "@/types/match";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { statusLabel, statusTone, confTier } from "@/lib/utils/match-status";
import { formatTime } from "@/lib/utils/time";

type Props = {
  match: Match | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

const FORM_COLORS: Record<string, string> = {
  W: "var(--color-primary-light)",
  D: "var(--color-draw)",
  L: "var(--color-loss)",
};

function FormString({ form }: { form: string }) {
  return (
    <span className="insight-form-string">
      {form.split("").map((ch, i) => (
        <span key={i} style={{ color: FORM_COLORS[ch.toUpperCase()] ?? "inherit" }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

// ---- Stats Bars ----

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
  const awayPct = 100 - homePct;
  return (
    <div className="insight-stat-bar">
      <div className="insight-stat-bar-labels">
        <span className="insight-stat-home-val">{homeLabel ?? homeVal}{isPercent ? "%" : ""}</span>
        <span className="insight-stat-name">{label}</span>
        <span className="insight-stat-away-val">{awayLabel ?? awayVal}{isPercent ? "%" : ""}</span>
      </div>
      <div className="insight-stat-bar-track">
        <div className="insight-stat-bar-home" style={{ width: `${homePct}%` }} />
        <div className="insight-stat-bar-away" style={{ width: `${awayPct}%` }} />
      </div>
    </div>
  );
}

function StatsSection({ stats, homeShort, awayShort }: { stats: MatchStats; homeShort: string; awayShort: string }) {
  return (
    <div className="insight-section">
      <div className="insight-stats-header">
        <h4 className="insight-label">Stats</h4>
        <div className="insight-stats-teams">
          <span className="insight-stats-team-label">{homeShort}</span>
          <span className="insight-stats-team-label insight-stats-team-label--away">{awayShort}</span>
        </div>
      </div>
      <div className="insight-stats-bars">
        <StatBar label="Possession" homeVal={stats.possession.home} awayVal={stats.possession.away} isPercent />
        <StatBar label="Shots" homeVal={stats.shots.home} awayVal={stats.shots.away} />
        <StatBar label="On Target" homeVal={stats.shotsOnTarget.home} awayVal={stats.shotsOnTarget.away} />
        <StatBar
          label="xG"
          homeVal={stats.xg.home}
          awayVal={stats.xg.away}
          homeLabel={stats.xg.home.toFixed(1)}
          awayLabel={stats.xg.away.toFixed(1)}
        />
        <StatBar label="Pass Acc." homeVal={stats.passAccuracy.home} awayVal={stats.passAccuracy.away} isPercent />
        <StatBar label="Corners" homeVal={stats.corners.home} awayVal={stats.corners.away} />
      </div>
    </div>
  );
}

// ---- Event Timeline ----

const EVENT_ICON: Record<string, string> = {
  Goal: "\u26BD",
  Substitution: "\u21C4",
};

function cardIcon(detail: string) {
  const d = detail.toLowerCase();
  if (d.includes("red")) return "\uD83D\uDFE5";
  return "\uD83D\uDFE8";
}

function EventTimeline({
  events,
  homeTeam,
  awayTeam,
}: {
  events: Match["events"];
  homeTeam: string;
  awayTeam: string;
}) {
  if (!events.length) return null;

  return (
    <div className="insight-section">
      <h4 className="insight-label">Timeline</h4>
      <div className="insight-timeline">
        {events.map((ev, i) => {
          const isHome = ev.team === homeTeam;
          const icon = ev.type === "Card" ? cardIcon(ev.detail) : (EVENT_ICON[ev.type] ?? "\u2022");
          const isGoal = ev.type === "Goal";
          const isSub = ev.type === "Substitution";
          return (
            <div
              key={`${ev.minute}-${ev.player}-${i}`}
              className={`insight-tl-row${isHome ? " insight-tl-row--home" : " insight-tl-row--away"}`}
            >
              {isHome ? (
                <>
                  <div className={`insight-tl-content${isGoal ? " insight-tl-content--goal" : ""}`}>
                    <span className="insight-tl-player">{ev.player}</span>
                    {isSub && <span className="insight-tl-detail">{ev.detail}</span>}
                  </div>
                  <div className="insight-tl-spine">
                    <span className="insight-tl-min">{ev.minute}&apos;</span>
                    <span className={`insight-tl-icon${isGoal ? " insight-tl-icon--goal" : ""}`}>{icon}</span>
                  </div>
                  <div className="insight-tl-spacer" />
                </>
              ) : (
                <>
                  <div className="insight-tl-spacer" />
                  <div className="insight-tl-spine">
                    <span className="insight-tl-min">{ev.minute}&apos;</span>
                    <span className={`insight-tl-icon${isGoal ? " insight-tl-icon--goal" : ""}`}>{icon}</span>
                  </div>
                  <div className={`insight-tl-content insight-tl-content--right${isGoal ? " insight-tl-content--goal" : ""}`}>
                    <span className="insight-tl-player">{ev.player}</span>
                    {isSub && <span className="insight-tl-detail">{ev.detail}</span>}
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

// ---- Main Panel ----

export function MatchInsightPanel({ match, isFavorite, onToggleFavorite }: Props) {
  if (!match) {
    return (
      <EmptyState
        title="No match selected"
        description="Select a match from the list to view detailed insights."
      />
    );
  }

  return (
    <div className="insight-panel">
      <div className="insight-header">
        <div>
          <h3 className="insight-title">
            {match.home.name} vs {match.away.name}
          </h3>
          <p className="widget-meta">
            {match.league} &middot; {match.venue}
          </p>
        </div>
        <Button
          variant="muted"
          className={`favorite-btn${isFavorite ? " is-favorite" : ""}`}
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          title={isFavorite ? "Remove favorite" : "Add favorite"}
        >
          {isFavorite ? "Favored" : "Favorite"}
        </Button>
      </div>

      <div className="insight-status-row">
        <Badge tone={statusTone(match)}>
          {statusLabel(match)}
        </Badge>
        <span className="insight-kickoff">Kickoff: {formatTime(match.kickoffISO)}</span>
      </div>

      <div className="insight-score-block">
        <span className="insight-team">{match.home.short}</span>
        <span className="score">{match.score.home} - {match.score.away}</span>
        <span className="insight-team">{match.away.short}</span>
      </div>

      <div className="insight-section">
        <h4 className="insight-label">Prediction</h4>
        <div className="insight-row">
          <span className={`conf-heat insight-conf-heat conf-heat--${confTier(match.prediction.confidence)}`}>
            {match.prediction.confidence}%
          </span>
          <span>{match.prediction.advice}</span>
        </div>
        <p className="widget-meta">Expected goals: {match.prediction.expectedGoals.toFixed(1)}</p>
      </div>

      <div className="insight-section">
        <h4 className="insight-label">Market</h4>
        <div className="insight-odds">
          <div className="insight-odd">
            <span className="insight-odd-label">Home</span>
            <span className="insight-odd-value">{match.odds.home.toFixed(2)}</span>
          </div>
          <div className="insight-odd">
            <span className="insight-odd-label">Draw</span>
            <span className="insight-odd-value">{match.odds.draw.toFixed(2)}</span>
          </div>
          <div className="insight-odd">
            <span className="insight-odd-label">Away</span>
            <span className="insight-odd-value">{match.odds.away.toFixed(2)}</span>
          </div>
        </div>
        <div className="insight-odds-extra">
          <span>O2.5: {match.odds.over25.toFixed(2)}</span>
          <span>BTTS: {match.odds.btts.toFixed(2)}</span>
        </div>
      </div>

      {match.stats && (
        <StatsSection
          stats={match.stats}
          homeShort={match.home.short}
          awayShort={match.away.short}
        />
      )}

      <div className="insight-section">
        <h4 className="insight-label">Form</h4>
        <div className="insight-form-row">
          <span>{match.home.short}</span>
          <FormString form={match.home.form.recent} />
        </div>
        <div className="insight-form-row">
          <span>{match.away.short}</span>
          <FormString form={match.away.form.recent} />
        </div>
      </div>

      <EventTimeline
        events={match.events}
        homeTeam={match.home.name}
        awayTeam={match.away.name}
      />

      <Link href={`/match/${match.id}`} className="detail-link insight-detail-link">
        View full match detail
      </Link>
    </div>
  );
}
