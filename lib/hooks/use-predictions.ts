"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readPredictions,
  writePredictions,
  type PredictionRecord,
  type PredictionOutcome,
} from "@/lib/storage/predictions";
import type { SlipPick } from "@/lib/storage/bet-slip";

export function usePredictions() {
  const [records, setRecords] = useState<PredictionRecord[]>([]);

  useEffect(() => {
    setRecords(readPredictions());
  }, []);

  /** Add picks from the bet slip as pending predictions (skips duplicates). */
  const addFromPicks = useCallback((picks: SlipPick[]): number => {
    const existing = readPredictions();
    const existingIds = new Set(existing.map((r) => r.id));
    const fresh: PredictionRecord[] = picks
      .filter((p) => !existingIds.has(p.id))
      .map((p) => ({
        id: p.id,
        matchId: p.matchId,
        matchLabel: p.matchLabel,
        market: p.market,
        odds: p.odds,
        stake: p.stake,
        outcome: "pending" as PredictionOutcome,
        addedAt: p.addedAt,
      }));
    const updated = [...existing, ...fresh];
    writePredictions(updated);
    setRecords(updated);
    return fresh.length;
  }, []);

  /** Settle a prediction with a result. */
  const settle = useCallback((id: string, outcome: PredictionOutcome) => {
    const updated = readPredictions().map((r) =>
      r.id === id
        ? { ...r, outcome, settledAt: new Date().toISOString() }
        : r
    );
    writePredictions(updated);
    setRecords(updated);
  }, []);

  /** Remove a single record. */
  const remove = useCallback((id: string) => {
    const updated = readPredictions().filter((r) => r.id !== id);
    writePredictions(updated);
    setRecords(updated);
  }, []);

  /** Wipe entire history. */
  const clearHistory = useCallback(() => {
    writePredictions([]);
    setRecords([]);
  }, []);

  // Derived stats
  const pending  = records.filter((r) => r.outcome === "pending");
  const settled  = records.filter((r) => r.outcome !== "pending");
  const won      = records.filter((r) => r.outcome === "won");
  const lost     = records.filter((r) => r.outcome === "lost");
  const nonVoid  = settled.filter((r) => r.outcome !== "void");

  const winRate      = nonVoid.length > 0 ? (won.length / nonVoid.length) * 100 : 0;
  const totalStaked  = records.reduce((s, r) => s + (r.stake ?? 0), 0);
  const totalReturns = won.reduce((s, r) => s + (r.stake ?? 0) * r.odds, 0);
  const roi          = totalStaked > 0 ? ((totalReturns - totalStaked) / totalStaked) * 100 : 0;
  const pnl          = totalReturns - totalStaked;

  return {
    records,
    pending,
    settled,
    won,
    lost,
    addFromPicks,
    settle,
    remove,
    clearHistory,
    stats: {
      total: records.length,
      winRate,
      totalStaked,
      totalReturns,
      roi,
      pnl,
    },
  };
}
