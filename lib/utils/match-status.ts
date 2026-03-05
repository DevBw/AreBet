import type { Match } from "@/types/match";

/** Derive a display label for a match status. */
export function statusLabel(match: Match): string {
  if (match.status === "LIVE") {
    if (match.minute === 45 || match.minute === 46) return "HT";
    if (match.minute) return `LIVE ${match.minute}'`;
    return "LIVE";
  }
  if (match.status === "FINISHED") return "FT";
  return "UPCOMING";
}

/** Confidence heat tier for visual intensity (green-based). */
export type ConfTier = "low" | "mid" | "high";

export function confTier(confidence: number): ConfTier {
  if (confidence >= 75) return "high";
  if (confidence >= 60) return "mid";
  return "low";
}

/** Derive a badge tone for CSS styling. */
export function statusTone(match: Match): "live" | "ht" | "upcoming" | "finished" {
  if (match.status === "LIVE") {
    if (match.minute === 45 || match.minute === 46) return "ht";
    return "live";
  }
  if (match.status === "FINISHED") return "finished";
  return "upcoming";
}
