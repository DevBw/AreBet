import type { Match } from "@/types/match";
import type { FavoriteItem } from "@/lib/hooks/use-favorites";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SortKey = "confidence" | "kickoff" | "odds" | "league";

type RankOptions = {
  matches: Match[];
  favorites: FavoriteItem[];
  sortKey: SortKey;
  favoritesFirst: boolean;
  hideFinished: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFavoriteLabels(favorites: FavoriteItem[]): Set<string> {
  const set = new Set<string>();
  for (const f of favorites) {
    if (f.entity_type === "team" || f.entity_type === "league") {
      set.add(f.label.toLowerCase());
    }
  }
  return set;
}

function isFavoredMatch(match: Match, labels: Set<string>): boolean {
  return (
    labels.has(match.home.name.toLowerCase()) ||
    labels.has(match.away.name.toLowerCase()) ||
    labels.has(match.league.toLowerCase())
  );
}

function safeNum(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function compareBy(a: Match, b: Match, key: SortKey): number {
  switch (key) {
    case "confidence":
      return safeNum(b.prediction.confidence, -1) - safeNum(a.prediction.confidence, -1);
    case "kickoff":
      return (a.kickoffISO ?? "").localeCompare(b.kickoffISO ?? "");
    case "odds":
      return safeNum(a.odds.home, Infinity) - safeNum(b.odds.home, Infinity);
    case "league":
      return a.league.localeCompare(b.league);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function rankMatches({
  matches,
  favorites,
  sortKey,
  favoritesFirst,
  hideFinished,
}: RankOptions): Match[] {
  let data = matches;

  if (hideFinished) {
    data = data.filter((m) => m.status !== "FINISHED");
  }

  const sorted = [...data].sort((a, b) => compareBy(a, b, sortKey));

  if (!favoritesFirst || favorites.length === 0) {
    return sorted;
  }

  const labels = buildFavoriteLabels(favorites);
  const favored: Match[] = [];
  const rest: Match[] = [];

  for (const m of sorted) {
    if (isFavoredMatch(m, labels)) {
      favored.push(m);
    } else {
      rest.push(m);
    }
  }

  return [...favored, ...rest];
}
