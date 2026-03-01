"use client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LocalFavorite = {
  entity_type: string;
  entity_id: string;
  label: string;
  meta: Record<string, unknown>;
  created_at: string;
};

export type LocalPreferences = {
  density: string;
  default_sort: string;
  default_filter_status: string;
  show_favorites_first: boolean;
  hide_finished: boolean;
  odds_format: string;
};

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

export const FAVORITES_KEY = "arebet:favorites:v1";
export const PREFERENCES_KEY = "arebet:preferences:v1";
export const MERGE_GUARD_PREFIX = "arebet:merge_done:v1:";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export function readLocalFavorites(): LocalFavorite[] {
  return safeRead<LocalFavorite[]>(FAVORITES_KEY, []);
}

export function writeLocalFavorites(favorites: LocalFavorite[]) {
  safeWrite(FAVORITES_KEY, favorites);
}

export function clearLocalFavorites() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FAVORITES_KEY);
}

// ---------------------------------------------------------------------------
// Preferences
// ---------------------------------------------------------------------------

export const DEFAULT_PREFERENCES: LocalPreferences = {
  density: "compact",
  default_sort: "kickoff",
  default_filter_status: "live",
  show_favorites_first: true,
  hide_finished: false,
  odds_format: "decimal",
};

export function readLocalPreferences(): LocalPreferences {
  return safeRead<LocalPreferences>(PREFERENCES_KEY, DEFAULT_PREFERENCES);
}

export function writeLocalPreferences(prefs: LocalPreferences) {
  safeWrite(PREFERENCES_KEY, prefs);
}

export function clearLocalPreferences() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PREFERENCES_KEY);
}

// ---------------------------------------------------------------------------
// Pure merge helpers (no side effects — used by StickinessSync and tests)
// ---------------------------------------------------------------------------

export type MergePreferencesResult = {
  result: LocalPreferences;
  strategy: "local_seeds_remote" | "remote_wins" | "no_merge_needed";
};

export function mergePreferences(
  local: LocalPreferences,
  remote: LocalPreferences
): MergePreferencesResult {
  const isLocalDefault = JSON.stringify(local) === JSON.stringify(DEFAULT_PREFERENCES);
  const isRemoteDefault = JSON.stringify(remote) === JSON.stringify(DEFAULT_PREFERENCES);

  if (isLocalDefault) {
    return { result: remote, strategy: "no_merge_needed" };
  }
  if (isRemoteDefault) {
    return { result: local, strategy: "local_seeds_remote" };
  }
  return { result: remote, strategy: "remote_wins" };
}

export function normalizeFavorite(fav: LocalFavorite): LocalFavorite {
  return {
    entity_type: String(fav.entity_type).trim(),
    entity_id: String(fav.entity_id).trim(),
    label: String(fav.label).trim(),
    meta: fav.meta && typeof fav.meta === "object" ? fav.meta : {},
    created_at: fav.created_at || new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Merge guard (sessionStorage — cleared on tab close)
// ---------------------------------------------------------------------------

export function isMergeDone(userId: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(MERGE_GUARD_PREFIX + userId) === "1";
  } catch {
    return false;
  }
}

export function markMergeDone(userId: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(MERGE_GUARD_PREFIX + userId, "1");
  } catch {
    // ignore
  }
}

export function clearMergeGuard(userId?: string) {
  if (typeof window === "undefined") return;
  try {
    if (userId) {
      sessionStorage.removeItem(MERGE_GUARD_PREFIX + userId);
    } else {
      // Clear all merge guards
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(MERGE_GUARD_PREFIX)) sessionStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}
