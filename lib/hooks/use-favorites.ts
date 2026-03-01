"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import {
  getFavorites as fetchRemoteFavorites,
  addFavorite,
  removeFavorite,
  type FavoriteInput,
} from "@/lib/services/favorites";
import { readLocalFavorites, writeLocalFavorites, FAVORITES_KEY } from "@/lib/storage/stickiness";

// ---------------------------------------------------------------------------
// Normalised item shared across local & remote
// ---------------------------------------------------------------------------

export type FavoriteItem = {
  entity_type: string;
  entity_id: string;
  label: string;
  meta: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFavorites() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track whether initial load has completed for the current auth state
  const loadedForRef = useRef<string | null>(null);

  // Per-entity in-flight tracking + pending intent queue (last-intent-wins)
  const inflightRef = useRef(new Map<string, { wantFavorited: boolean; input: FavoriteInput }>());

  // ------------------------------------------------------------------
  // Load helper (reusable for initial load + focus refetch)
  // ------------------------------------------------------------------

  const loadFavorites = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setLoading(true);
        setError(null);
      }
      try {
        if (userId) {
          const remote = await fetchRemoteFavorites(userId);
          setItems(
            remote.map((r) => ({
              entity_type: r.entity_type,
              entity_id: r.entity_id,
              label: r.label,
              meta: (r.meta ?? {}) as Record<string, unknown>,
            }))
          );
        } else {
          setItems(
            readLocalFavorites().map((l) => ({
              entity_type: l.entity_type,
              entity_id: l.entity_id,
              label: l.label,
              meta: l.meta,
            }))
          );
        }
      } catch (err) {
        if (!opts?.silent) {
          setError(err instanceof Error ? err.message : "Failed to load favorites");
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

    loadFavorites().then(() => {
      if (!cancelled) loadedForRef.current = key;
    });

    return () => { cancelled = true; };
  }, [userId, loadFavorites]);

  // ------------------------------------------------------------------
  // Multi-tab: refetch on window focus (authed) / storage event (guest)
  // ------------------------------------------------------------------

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function handleVisibility() {
      if (document.visibilityState !== "visible" || !userId) return;
      // Debounce: don't refetch more than once per 2s
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadFavorites({ silent: true });
      }, 500);
    }

    function handleStorage(e: StorageEvent) {
      // Only react when logged out (localStorage mode) and our key changed
      if (userId || e.key !== FAVORITES_KEY) return;
      setItems(
        readLocalFavorites().map((l) => ({
          entity_type: l.entity_type,
          entity_id: l.entity_id,
          label: l.label,
          meta: l.meta,
        }))
      );
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("storage", handleStorage);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", handleStorage);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [userId, loadFavorites]);

  // ------------------------------------------------------------------
  // Derived lookup
  // ------------------------------------------------------------------

  const favSet = useMemo(() => {
    const s = new Set<string>();
    for (const f of items) s.add(`${f.entity_type}:${f.entity_id}`);
    return s;
  }, [items]);

  const isFavorite = useCallback(
    (entityType: string, entityId: string) => favSet.has(`${entityType}:${entityId}`),
    [favSet]
  );

  // ------------------------------------------------------------------
  // Toggle (optimistic + last-intent-wins per entity)
  // ------------------------------------------------------------------

  const executeToggle = useCallback(
    async (input: FavoriteInput, wantFavorited: boolean) => {
      const key = `${input.entityType}:${input.entityId}`;

      // Apply optimistic state
      if (wantFavorited) {
        setItems((old) => {
          if (old.some((f) => `${f.entity_type}:${f.entity_id}` === key)) return old;
          return [...old, {
            entity_type: input.entityType,
            entity_id: input.entityId,
            label: input.label,
            meta: input.meta ?? {},
          }];
        });
      } else {
        setItems((old) => old.filter((f) => `${f.entity_type}:${f.entity_id}` !== key));
      }

      try {
        if (userId) {
          if (wantFavorited) {
            await addFavorite(userId, input);
          } else {
            await removeFavorite(userId, input.entityType, input.entityId);
          }
        } else {
          if (wantFavorited) {
            const current = readLocalFavorites();
            if (!current.some((f) => f.entity_type === input.entityType && f.entity_id === input.entityId)) {
              writeLocalFavorites([...current, {
                entity_type: input.entityType,
                entity_id: input.entityId,
                label: input.label,
                meta: input.meta ?? {},
                created_at: new Date().toISOString(),
              }]);
            }
          } else {
            writeLocalFavorites(
              readLocalFavorites().filter(
                (f) => !(f.entity_type === input.entityType && f.entity_id === input.entityId)
              )
            );
          }
        }
        setError(null);
      } catch (err) {
        // Rollback: revert optimistic state
        if (wantFavorited) {
          setItems((old) => old.filter((f) => `${f.entity_type}:${f.entity_id}` !== key));
        } else {
          setItems((old) => [...old, {
            entity_type: input.entityType,
            entity_id: input.entityId,
            label: input.label,
            meta: input.meta ?? {},
          }]);
        }
        setError(err instanceof Error ? err.message : "Failed to update favorite");
      }

      // Check if a newer intent was queued while this request was in flight
      const pending = inflightRef.current.get(key);
      if (pending && pending.wantFavorited !== wantFavorited) {
        // Drain the pending intent and execute it
        inflightRef.current.delete(key);
        await executeToggle(pending.input, pending.wantFavorited);
      } else {
        inflightRef.current.delete(key);
      }
    },
    [userId]
  );

  const toggleFavorite = useCallback(
    async (input: FavoriteInput) => {
      const key = `${input.entityType}:${input.entityId}`;
      const currently = favSet.has(key);
      const wantFavorited = !currently;

      // If already in flight for this entity, store intent and return
      if (inflightRef.current.has(key)) {
        inflightRef.current.set(key, { wantFavorited, input });
        // Optimistic UI: update immediately even while queued
        if (wantFavorited) {
          setItems((old) => {
            if (old.some((f) => `${f.entity_type}:${f.entity_id}` === key)) return old;
            return [...old, {
              entity_type: input.entityType,
              entity_id: input.entityId,
              label: input.label,
              meta: input.meta ?? {},
            }];
          });
        } else {
          setItems((old) => old.filter((f) => `${f.entity_type}:${f.entity_id}` !== key));
        }
        return;
      }

      // Mark in-flight (no pending intent yet)
      inflightRef.current.set(key, { wantFavorited, input });
      await executeToggle(input, wantFavorited);
    },
    [favSet, executeToggle]
  );

  // Expose refetch for external callers (e.g., merge completion)
  const refetch = useCallback(() => loadFavorites({ silent: true }), [loadFavorites]);

  return { favorites: items, isFavorite, toggleFavorite, loading, error, refetch };
}
