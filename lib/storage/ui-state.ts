// ---------------------------------------------------------------------------
// Lightweight UI state persistence (localStorage)
// ---------------------------------------------------------------------------

const LAST_LEAGUE_KEY = "arebet:last_widgets_league:v1";

function safeRead(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage full or unavailable
  }
}

// ---------------------------------------------------------------------------
// Last selected league (widgets page)
// ---------------------------------------------------------------------------

export function readLastLeague(): string | null {
  return safeRead(LAST_LEAGUE_KEY);
}

export function writeLastLeague(league: string) {
  safeWrite(LAST_LEAGUE_KEY, league);
}
