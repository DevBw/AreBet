"use client";

import { useState } from "react";
import { usePredictions } from "@/lib/hooks/use-predictions";
import type { PredictionRecord, PredictionOutcome } from "@/lib/storage/predictions";

// ── Outcome badge ─────────────────────────────────────────────────────────────

function OutcomeBadge({ outcome }: { outcome: PredictionOutcome }) {
  const labels: Record<PredictionOutcome, string> = {
    pending: "Pending",
    won:     "Won",
    lost:    "Lost",
    void:    "Void",
  };
  return (
    <span className={`pt-badge pt-badge--${outcome}`}>{labels[outcome]}</span>
  );
}

// ── Single record row ─────────────────────────────────────────────────────────

function RecordRow({
  record,
  onSettle,
  onRemove,
}: {
  record: PredictionRecord;
  onSettle: (id: string, outcome: PredictionOutcome) => void;
  onRemove: (id: string) => void;
}) {
  const potReturn =
    record.stake != null && record.stake > 0
      ? (record.stake * record.odds).toFixed(2)
      : null;

  const pnl =
    record.outcome === "won" && record.stake != null
      ? record.stake * record.odds - record.stake
      : record.outcome === "lost" && record.stake != null
      ? -record.stake
      : null;

  return (
    <div className={`pt-row pt-row--${record.outcome}`}>
      <div className="pt-row-top">
        <div className="pt-row-info">
          <span className="pt-row-market">{record.market}</span>
          <span className="pt-row-match">{record.matchLabel}</span>
        </div>
        <div className="pt-row-meta">
          <span className="pt-row-odds">{record.odds.toFixed(2)}</span>
          {record.stake != null && (
            <span className="pt-row-stake">£{record.stake.toFixed(2)}</span>
          )}
          {pnl !== null && (
            <span className={`pt-row-pnl${pnl >= 0 ? " is-positive" : " is-negative"}`}>
              {pnl >= 0 ? "+" : ""}£{pnl.toFixed(2)}
            </span>
          )}
        </div>
        <OutcomeBadge outcome={record.outcome} />
        <button
          type="button"
          className="pt-row-remove"
          onClick={() => onRemove(record.id)}
          aria-label="Remove prediction"
        >
          &times;
        </button>
      </div>

      {potReturn && record.outcome === "pending" && (
        <div className="pt-row-sub">
          Potential return: <strong>£{potReturn}</strong>
        </div>
      )}

      {/* Settle buttons — only for pending */}
      {record.outcome === "pending" && (
        <div className="pt-settle-row">
          <button
            type="button"
            className="pt-settle-btn pt-settle-btn--won"
            onClick={() => onSettle(record.id, "won")}
          >
            Won
          </button>
          <button
            type="button"
            className="pt-settle-btn pt-settle-btn--lost"
            onClick={() => onSettle(record.id, "lost")}
          >
            Lost
          </button>
          <button
            type="button"
            className="pt-settle-btn pt-settle-btn--void"
            onClick={() => onSettle(record.id, "void")}
          >
            Void
          </button>
        </div>
      )}
    </div>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar({
  stats,
  total,
  pending,
}: {
  stats: ReturnType<typeof usePredictions>["stats"];
  total: number;
  pending: number;
}) {
  const pnlPositive = stats.pnl >= 0;
  return (
    <div className="pt-stats">
      <div className="pt-stat">
        <span className="pt-stat-value">{total}</span>
        <span className="pt-stat-label">Total picks</span>
      </div>
      <div className="pt-stat">
        <span className="pt-stat-value">{pending}</span>
        <span className="pt-stat-label">Pending</span>
      </div>
      <div className="pt-stat">
        <span className={`pt-stat-value${stats.winRate > 0 ? " is-positive" : ""}`}>
          {stats.winRate > 0 ? `${stats.winRate.toFixed(0)}%` : "—"}
        </span>
        <span className="pt-stat-label">Win rate</span>
      </div>
      <div className="pt-stat">
        <span className={`pt-stat-value${stats.roi !== 0 ? (stats.roi > 0 ? " is-positive" : " is-negative") : ""}`}>
          {stats.totalStaked > 0 ? `${stats.roi >= 0 ? "+" : ""}${stats.roi.toFixed(1)}%` : "—"}
        </span>
        <span className="pt-stat-label">ROI</span>
      </div>
      <div className="pt-stat">
        <span className={`pt-stat-value${pnlPositive && stats.pnl !== 0 ? " is-positive" : !pnlPositive ? " is-negative" : ""}`}>
          {stats.totalStaked > 0
            ? `${stats.pnl >= 0 ? "+" : ""}£${stats.pnl.toFixed(2)}`
            : "—"}
        </span>
        <span className="pt-stat-label">P&amp;L</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PredictionTracker() {
  const { records, pending, settled, settle, remove, clearHistory, stats } =
    usePredictions();
  const [confirmClear, setConfirmClear] = useState(false);

  if (records.length === 0) {
    return (
      <div className="pt-empty">
        <div className="pt-empty-icon">📋</div>
        <h3 className="pt-empty-title">No picks tracked yet</h3>
        <p className="pt-empty-desc">
          Open your Bet Slip, add selections, then tap{" "}
          <strong>Track Picks</strong> to save them here.
          Mark each one Won / Lost when the match ends.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-root">
      {/* Stats row */}
      <StatsBar stats={stats} total={records.length} pending={pending.length} />

      {/* Pending section */}
      {pending.length > 0 && (
        <section className="pt-section">
          <h3 className="pt-section-title">
            Pending
            <span className="pt-section-count">{pending.length}</span>
          </h3>
          <div className="pt-list">
            {pending.map((r) => (
              <RecordRow key={r.id} record={r} onSettle={settle} onRemove={remove} />
            ))}
          </div>
        </section>
      )}

      {/* Settled section */}
      {settled.length > 0 && (
        <section className="pt-section">
          <h3 className="pt-section-title">
            History
            <span className="pt-section-count">{settled.length}</span>
          </h3>
          <div className="pt-list">
            {[...settled].reverse().map((r) => (
              <RecordRow key={r.id} record={r} onSettle={settle} onRemove={remove} />
            ))}
          </div>
        </section>
      )}

      {/* Clear all */}
      <div className="pt-footer">
        {confirmClear ? (
          <>
            <span className="pt-footer-confirm">Delete all records?</span>
            <button
              type="button"
              className="pt-footer-btn pt-footer-btn--danger"
              onClick={() => { clearHistory(); setConfirmClear(false); }}
            >
              Yes, clear all
            </button>
            <button
              type="button"
              className="pt-footer-btn"
              onClick={() => setConfirmClear(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className="pt-footer-btn"
            onClick={() => setConfirmClear(true)}
          >
            Clear history
          </button>
        )}
      </div>
    </div>
  );
}
