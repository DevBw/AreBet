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
  PREFERENCES_KEY,
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
  // Load helper (reusable for initial load + focus refetch)
  // ------------------------------------------------------------------

  const loadPreferences = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setLoading(true);
        setError(null);
      }
      try {
        if (userId) {
          const remote = await fetchRemotePreferences(userId);
          setPreferences(remote);
        } else {
          setPreferences(readLocalPreferences());
        }
      } catch (err) {
        if (!opts?.silent) {
          setError(err instanceof Error ? err.message : "Failed to load preferences");
        }
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [userId]
  );

  // ------------------------------------------------------------------
  // Initial load
  // ------------------------------------------------------------------

  useEffect(() => {
    const key = userId ?? "__local__";
    if (loadedForRef.current === key) return;

    let cancelled = false;

    loadPreferences().then(() => {
      if (!cancelled) loadedForRef.current = key;
    });

    return () => { cancelled = true; };
  }, [userId, loadPreferences]);

  // ------------------------------------------------------------------
  // Multi-tab: refetch on focus (authed) / storage event (guest)
  // ------------------------------------------------------------------

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function handleVisibility() {
      if (document.visibilityState !== "visible" || !userId) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadPreferences({ silent: true });
      }, 500);
    }

    function handleStorage(e: StorageEvent) {
      if (userId || e.key !== PREFERENCES_KEY) return;
      setPreferences(readLocalPreferences());
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("storage", handleStorage);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", handleStorage);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [userId, loadPreferences]);

  // ------------------------------------------------------------------
  // Update (debounced remote write, safe rollback via re-fetch)
  // ------------------------------------------------------------------

  const updatePreferences = useCallback(
    (partial: Partial<LocalPreferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...partial };

        if (userId) {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            pushRemotePreferences(userId, partial).catch(() => {
              // Revert: re-read from remote to get actual state (avoids stale closure)
              fetchRemotePreferences(userId)
                .then((remote) => setPreferences(remote))
                .catch(() => setError("Failed to save preferences"));
            });
          }, 500);
        } else {
          try {
            writeLocalPreferences(next);
          } catch {
            // Revert to last known local value
            setPreferences(readLocalPreferences());
            setError("Failed to save preferences locally");
          }
        }

        return next;
      });
    },
    [userId]
  );

  const refetch = useCallback(() => loadPreferences({ silent: true }), [loadPreferences]);

  return { preferences, updatePreferences, loading, error, refetch };
}
