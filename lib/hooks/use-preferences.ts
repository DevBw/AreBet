"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import {
  getPreferences as fetchRemotePreferences,
  updatePreferences as pushRemotePreferences,
} from "@/lib/services/preferences";
import {
  DEFAULT_PREFERENCES,
  readLocalPreferences,
  writeLocalPreferences,
  type LocalPreferences,
} from "@/lib/storage/stickiness";

export function usePreferences() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [preferences, setPreferences] = useState<LocalPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadedForRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ------------------------------------------------------------------
  // Load
  // ------------------------------------------------------------------

  useEffect(() => {
    const key = userId ?? "__local__";
    if (loadedForRef.current === key) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (userId) {
          const remote = await fetchRemotePreferences(userId);
          if (!cancelled) setPreferences(remote);
        } else {
          if (!cancelled) setPreferences(readLocalPreferences());
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load preferences");
      } finally {
        if (!cancelled) {
          setLoading(false);
          loadedForRef.current = key;
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  // ------------------------------------------------------------------
  // Update (debounced remote write)
  // ------------------------------------------------------------------

  const updatePreferences = useCallback(
    (partial: Partial<LocalPreferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...partial };

        if (userId) {
          // Debounce remote writes by 500ms
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            pushRemotePreferences(userId, partial).catch(() => {
              // Revert on error
              setPreferences(prev);
              setError("Failed to save preferences");
            });
          }, 500);
        } else {
          writeLocalPreferences(next);
        }

        return next;
      });
    },
    [userId]
  );

  return { preferences, updatePreferences, loading, error };
}
