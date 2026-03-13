// ---------------------------------------------------------------------------
// Match ratings persistence (localStorage)
// ---------------------------------------------------------------------------

const RATINGS_KEY = "arebet:match-ratings:v1";

function safeRead(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeWrite(key: string, value: string) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, value); } catch { /* storage full */ }
}

export type MatchRatingsMap = Record<string, number>; // matchId (string) -> 1–5

export function readMatchRatings(): MatchRatingsMap {
  const raw = safeRead(RATINGS_KEY);
  if (!raw) return {};
  try { return JSON.parse(raw) as MatchRatingsMap; } catch { return {}; }
}

export function writeMatchRatings(ratings: MatchRatingsMap) {
  safeWrite(RATINGS_KEY, JSON.stringify(ratings));
}

export function setMatchRating(matchId: number, stars: number) {
  const ratings = readMatchRatings();
  ratings[String(matchId)] = Math.max(1, Math.min(5, Math.round(stars)));
  writeMatchRatings(ratings);
}

export function clearMatchRating(matchId: number) {
  const ratings = readMatchRatings();
  delete ratings[String(matchId)];
  writeMatchRatings(ratings);
}
