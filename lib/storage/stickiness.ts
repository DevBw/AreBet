"use client";

import type { Tables, TablesInsert } from "@/lib/supabase/types.generated";

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

const FAVORITES_KEY = "arebet:favorites:v1";
const PREFERENCES_KEY = "arebet:preferences:v1";

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
