// ---------------------------------------------------------------------------
// Onboarding persistence (localStorage)
// ---------------------------------------------------------------------------

const ONBOARDED_KEY   = "arebet:onboarded:v1";
const STAKE_KEY       = "arebet:default-stake:v1";
const FAV_LEAGUES_KEY = "arebet:fav-leagues:v1";

function safeRead(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeWrite(key: string, value: string) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, value); } catch { /* storage full */ }
}

// ---- Onboarding flag ----

export function isOnboarded(): boolean {
  return safeRead(ONBOARDED_KEY) === "true";
}

export function markOnboarded(): void {
  safeWrite(ONBOARDED_KEY, "true");
}

export function resetOnboarding(): void {
  try { localStorage.removeItem(ONBOARDED_KEY); } catch { /* noop */ }
}

// ---- Default stake ----

export function readDefaultStake(): number {
  const raw = safeRead(STAKE_KEY);
  const n = parseFloat(raw ?? "");
  return isNaN(n) ? 10 : n;
}

export function writeDefaultStake(stake: number): void {
  safeWrite(STAKE_KEY, String(stake));
}

// ---- Favourite leagues ----

export const ALL_LEAGUES = [
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Champions League",
  "Serie A",
  "Ligue 1",
] as const;

export type League = (typeof ALL_LEAGUES)[number];

export function readFavLeagues(): League[] {
  const raw = safeRead(FAV_LEAGUES_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as League[]; } catch { return []; }
}

export function writeFavLeagues(leagues: League[]): void {
  safeWrite(FAV_LEAGUES_KEY, JSON.stringify(leagues));
}
