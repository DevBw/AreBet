"use client";

import Link from "next/link";
import type { Match, MatchStats, H2HMatch, MatchPlayerRatings, PlayerRating } from "@/types/match";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StarRating } from "@/components/ui/star-rating";
import { statusLabel, statusTone, confTier } from "@/lib/utils/match-status";
import { formatTime } from "@/lib/utils/time";
import { useMatchRatings } from "@/lib/hooks/use-match-ratings";
import { useBetSlipContext } from "@/components/features/bet-slip-panel";
import { Sparkline } from "@/components/ui/sparkline";
import { getSparklineData } from "@/lib/demo/odds-history";

type Props = {
  match: Match | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

const FORM_BLOCK_CLASS: Record<string, string> = {
  W: "form-block--win",
  D: "form-block--draw",
  L: "form-block--loss",
};

function FormGuide({ form }: { form: string }) {
  return (
    <span className="form-guide">
      {form.split("").map((ch, i) => {
        const key = ch.toUpperCase();
        return (
          <span
            key={i}
            className={`form-block ${FORM_BLOCK_CLASS[key] ?? "form-block--draw"}`}
            title={key === "W" ? "Win" : key === "L" ? "Loss" : "Draw"}
          >
            {key}
          </span>
        );
      })}
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

// ---- H2H History ----

type H2HResult = "H" | "D" | "A";

function h2hResult(entry: H2HMatch, currentHomeTeam: string): H2HResult {
  if (entry.homeScore === entry.awayScore) return "D";
  const homeWon = entry.homeScore > entry.awayScore;
  const currentIsHome = entry.homeTeam === currentHomeTeam;
  if (currentIsHome) return homeWon ? "H" : "A";
  return homeWon ? "A" : "H";
}

const H2H_DOT: Record<H2HResult, string> = {
  H: "insight-h2h-dot--home",
  D: "insight-h2h-dot--draw",
  A: "insight-h2h-dot--away",
};

function H2HSection({
  h2h,
  homeTeam,
  homeShort,
  awayShort,
}: {
  h2h: H2HMatch[];
  homeTeam: string;
  homeShort: string;
  awayShort: string;
}) {
  return (
    <div className="insight-section">
      <div className="insight-h2h-header">
        <h4 className="insight-label">Head-to-Head</h4>
        <div className="insight-h2h-legend">
          <span className="insight-h2h-legend-item">
            <span className="insight-h2h-dot insight-h2h-dot--home" />
            {homeShort}
          </span>
          <span className="insight-h2h-legend-item">
            <span className="insight-h2h-dot insight-h2h-dot--draw" />
            Draw
          </span>
          <span className="insight-h2h-legend-item">
            <span className="insight-h2h-dot insight-h2h-dot--away" />
            {awayShort}
          </span>
        </div>
      </div>
      <div className="insight-h2h-list">
        {h2h.map((entry, i) => {
          const result = h2hResult(entry, homeTeam);
          return (
            <div key={i} className="insight-h2h-row">
              <div className="insight-h2h-side insight-h2h-side--left">
                <span className="insight-h2h-team">{entry.homeTeam}</span>
              </div>
              <div className="insight-h2h-centre">
                <span className={`insight-h2h-dot ${H2H_DOT[result]}`} />
                <span className="insight-h2h-scoreline">
                  {entry.homeScore} – {entry.awayScore}
                </span>
                <span className="insight-h2h-date">{entry.date}</span>
              </div>
              <div className="insight-h2h-side insight-h2h-side--right">
                <span className="insight-h2h-team">{entry.awayTeam}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Player Ratings Grid ----

function ratingTier(r: number): string {
  if (r >= 8.5) return "insight-rating-score--gold";
  if (r >= 7.5) return "insight-rating-score--high";
  if (r >= 6.5) return "insight-rating-score--mid";
  return "insight-rating-score--low";
}

function RatingsCol({ players }: { players: PlayerRating[] }) {
  return (
    <div className="insight-ratings-col">
      {players.map((p, i) => (
        <div key={i} className="insight-ratings-row">
          <span className="insight-ratings-pos">{p.position}</span>
          <span className="insight-ratings-name">{p.name}</span>
          <span className={`insight-rating-score ${ratingTier(p.rating)}`}>
            {p.rating.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

function PlayerRatingsSection({
  ratings,
  homeShort,
  awayShort,
}: {
  ratings: MatchPlayerRatings;
  homeShort: string;
  awayShort: string;
}) {
  return (
    <div className="insight-section">
      <h4 className="insight-label">Player Ratings</h4>
      <div className="insight-ratings-header-row">
        <span className="insight-ratings-col-header">{homeShort}</span>
        <span className="insight-ratings-col-header">{awayShort}</span>
      </div>
      <div className="insight-ratings-grid">
        <RatingsCol players={ratings.home} />
        <RatingsCol players={ratings.away} />
      </div>
    </div>
  );
}

// ---- Main Panel ----

export function MatchInsightPanel({ match, isFavorite, onToggleFavorite }: Props) {
  const { getRating, rate, unrate } = useMatchRatings();
  const { addPick, hasPick, removePickByMarket } = useBetSlipContext();

  if (!match) {
    return (
      <EmptyState
        title="No match selected"
        description="Select a match from the list to view detailed insights."
      />
    );
  }

  const matchLabel = `${match.home.short} vs ${match.away.short}`;
  const myRating = getRating(match.id);

  const SLIP_MARKETS = [
    { market: "Home Win",  odds: match.odds.home },
    { market: "Draw",      odds: match.odds.draw },
    { market: "Away Win",  odds: match.odds.away },
    { market: "Over 2.5",  odds: match.odds.over25 },
    { market: "BTTS Yes",  odds: match.odds.btts },
  ];

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
          {([
            { market: "Home Win", odds: match.odds.home,  label: "Home", histKey: "home"  as const },
            { market: "Draw",     odds: match.odds.draw,  label: "Draw", histKey: "draw"  as const },
            { market: "Away Win", odds: match.odds.away,  label: "Away", histKey: "away"  as const },
          ] as Array<{ market: string; odds: number; label: string; histKey: "home" | "draw" | "away" }>).map(({ market, odds, label, histKey }) => {
            const inSlip = hasPick(match.id, market);
            const sparkData = getSparklineData(match, histKey);
            return (
              <button
                key={market}
                type="button"
                className={`insight-odd insight-odd-btn${inSlip ? " is-slipped" : ""}`}
                onClick={() =>
                  inSlip
                    ? removePickByMarket(match.id, market)
                    : addPick({ matchId: match.id, matchLabel, market, odds })
                }
                title={inSlip ? `Remove ${market} from slip` : `Add ${market} to slip`}
              >
                <span className="insight-odd-label">{label}</span>
                <Sparkline data={sparkData} width={44} height={18} />
                <span className="insight-odd-value">{odds.toFixed(2)}</span>
                {inSlip && <span className="insight-odd-check" aria-hidden="true">\u2713</span>}
              </button>
            );
          })}
        </div>
        <div className="insight-odds-extra">
          {[
            { market: "Over 2.5", odds: match.odds.over25, label: "O2.5" },
            { market: "BTTS Yes", odds: match.odds.btts,   label: "BTTS" },
          ].map(({ market, odds, label }) => {
            const inSlip = hasPick(match.id, market);
            return (
              <button
                key={market}
                type="button"
                className={`insight-odds-extra-btn${inSlip ? " is-slipped" : ""}`}
                onClick={() =>
                  inSlip
                    ? removePickByMarket(match.id, market)
                    : addPick({ matchId: match.id, matchLabel, market, odds })
                }
                title={inSlip ? `Remove ${market} from slip` : `Add ${market} to slip`}
              >
                {label}: {odds.toFixed(2)}{inSlip ? " \u2713" : ""}
              </button>
            );
          })}
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
          <FormGuide form={match.home.form.recent} />
        </div>
        <div className="insight-form-row">
          <span>{match.away.short}</span>
          <FormGuide form={match.away.form.recent} />
        </div>
      </div>

      {match.h2h && match.h2h.length > 0 && (
        <H2HSection
          h2h={match.h2h}
          homeTeam={match.home.name}
          homeShort={match.home.short}
          awayShort={match.away.short}
        />
      )}

      {match.playerRatings && (
        <PlayerRatingsSection
          ratings={match.playerRatings}
          homeShort={match.home.short}
          awayShort={match.away.short}
        />
      )}

      <EventTimeline
        events={match.events}
        homeTeam={match.home.name}
        awayTeam={match.away.name}
      />

      {/* Your Rating */}
      <div className="insight-section">
        <h4 className="insight-label">Your Rating</h4>
        <div className="insight-row insight-rating-row">
          <StarRating
            value={myRating}
            onChange={(stars) =>
              stars === 0 ? unrate(match.id) : rate(match.id, stars)
            }
          />
          <span className="widget-meta">
            {myRating > 0 ? `${myRating} / 5` : "Tap to rate this match"}
          </span>
        </div>
      </div>

      {/* Add to Slip — quick row of all markets */}
      <div className="insight-section">
        <h4 className="insight-label">Add to Slip</h4>
        <div className="insight-slip-row">
          {SLIP_MARKETS.map(({ market, odds }) => {
            const inSlip = hasPick(match.id, market);
            return (
              <button
                key={market}
                type="button"
                className={`slip-market-pill${inSlip ? " is-added" : ""}`}
                onClick={() =>
                  inSlip
                    ? removePickByMarket(match.id, market)
                    : addPick({ matchId: match.id, matchLabel, market, odds })
                }
              >
                {market}
                <span className="slip-market-odds">{odds.toFixed(2)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Link href={`/match/${match.id}`} className="detail-link insight-detail-link">
        View full match detail
      </Link>
    </div>
  );
}
