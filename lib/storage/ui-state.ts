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

// ---------------------------------------------------------------------------
// Last quick filter
// ---------------------------------------------------------------------------

const QUICK_FILTER_KEY = "arebet:last_quick_filter:v1";

export type QuickFilter = "all" | "live" | "soon" | "favorites" | "high-conf";

const VALID_FILTERS: Set<string> = new Set(["all", "live", "soon", "favorites", "high-conf"]);

export function readLastQuickFilter(): QuickFilter {
  const val = safeRead(QUICK_FILTER_KEY);
  if (val && VALID_FILTERS.has(val)) return val as QuickFilter;
  return "all";
}

export function writeLastQuickFilter(filter: QuickFilter) {
  safeWrite(QUICK_FILTER_KEY, filter);
}
