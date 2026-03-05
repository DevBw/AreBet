"use client";

import Link from "next/link";
import type { Match } from "@/types/match";
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

      {match.events.length > 0 && (
        <div className="insight-section">
          <h4 className="insight-label">Events</h4>
          <div className="insight-events">
            {match.events.map((ev) => (
              <div key={`${ev.minute}-${ev.player}`} className="insight-event">
                <span className="insight-event-min">{ev.minute}&apos;</span>
                <span>
                  {ev.type} &mdash; {ev.player}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href={`/match/${match.id}`} className="detail-link insight-detail-link">
        View full match detail
      </Link>
    </div>
  );
}
