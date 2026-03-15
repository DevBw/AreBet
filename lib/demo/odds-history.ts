// ---------------------------------------------------------------------------
// Deterministic demo odds history generator
// Uses match ID + market as a seed so the same match always shows the same
// sparkline, but different markets look distinct.
// ---------------------------------------------------------------------------

import type { Match } from "@/types/match";

/** Extract odds history values for the main 1X2 markets from marketHistory. */
export function getMarketHistoryValues(
  match: Match,
  market: "home" | "draw" | "away"
): number[] {
  if (!match.marketHistory?.length) return [];
  return match.marketHistory.map((p) => p[market]);
}

/** Simple linear-congruential seeded random. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = ((s * 1664525 + 1013904223) & 0xffffffff) >>> 0;
    return s / 0xffffffff;
  };
}

/**
 * Generate synthetic 7-point odds history for markets that don't have
 * real marketHistory data (e.g. Over 2.5, BTTS).
 * Result always ends at `currentOdds`.
 */
export function generateSyntheticHistory(
  matchId: number,
  market: string,
  currentOdds: number
): number[] {
  const seed = matchId * 97 + market.charCodeAt(0) * 31;
  const rand = makeRng(seed);
  const labels = 7;

  // Random starting offset ±15% from current
  let val = currentOdds * (1 + (rand() - 0.5) * 0.3);

  const points: number[] = [];
  for (let i = 0; i < labels - 1; i++) {
    points.push(Math.max(1.01, parseFloat(val.toFixed(2))));
    // Walk toward current odds each step
    const drift = (currentOdds - val) * 0.4 + (rand() - 0.5) * 0.08;
    val += drift;
  }
  points.push(parseFloat(currentOdds.toFixed(2)));
  return points;
}

/** Get sparkline data for any market on a match (uses real history if available). */
export function getSparklineData(
  match: Match,
  market: "home" | "draw" | "away" | "over25" | "btts"
): number[] {
  if (market === "home" || market === "draw" || market === "away") {
    const real = getMarketHistoryValues(match, market);
    if (real.length >= 2) return real;
  }
  const currentOdds = match.odds[market];
  return generateSyntheticHistory(match.id, market, currentOdds);
}
