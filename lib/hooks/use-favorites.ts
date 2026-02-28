"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import {
  getFavorites as fetchRemoteFavorites,
  addFavorite,
  removeFavorite,
  type Favorite,
  type FavoriteInput,
} from "@/lib/services/favorites";
import {
  readLocalFavorites,
  writeLocalFavorites,
  type LocalFavorite,
} from "@/lib/storage/stickiness";

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
          const remote = await fetchRemoteFavorites(userId);
          if (!cancelled) {
            setItems(
              remote.map((r) => ({
                entity_type: r.entity_type,
                entity_id: r.entity_id,
                label: r.label,
                meta: (r.meta ?? {}) as Record<string, unknown>,
              }))
            );
          }
        } else {
          const local = readLocalFavorites();
          if (!cancelled) {
            setItems(
              local.map((l) => ({
                entity_type: l.entity_type,
                entity_id: l.entity_id,
                label: l.label,
                meta: l.meta,
              }))
            );
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load favorites");
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
  // Toggle (optimistic)
  // ------------------------------------------------------------------

  const toggleFavorite = useCallback(
    async (input: FavoriteInput) => {
      const key = `${input.entityType}:${input.entityId}`;
      const currently = favSet.has(key);
      const prev = [...items];

      // Optimistic update
      if (currently) {
        setItems((old) => old.filter((f) => `${f.entity_type}:${f.entity_id}` !== key));
      } else {
        setItems((old) => [
          ...old,
          {
            entity_type: input.entityType,
            entity_id: input.entityId,
            label: input.label,
            meta: input.meta ?? {},
          },
        ]);
      }

      try {
        if (userId) {
          if (currently) {
            await removeFavorite(userId, input.entityType, input.entityId);
          } else {
            await addFavorite(userId, input);
          }
        } else {
          // Guest: persist to localStorage
          const updated = currently
            ? readLocalFavorites().filter(
                (f) => !(f.entity_type === input.entityType && f.entity_id === input.entityId)
              )
            : [
                ...readLocalFavorites(),
                {
                  entity_type: input.entityType,
                  entity_id: input.entityId,
                  label: input.label,
                  meta: input.meta ?? {},
                  created_at: new Date().toISOString(),
                },
              ];
          writeLocalFavorites(updated);
        }
      } catch {
        // Rollback on error
        setItems(prev);
      }
    },
    [favSet, items, userId]
  );

  return { favorites: items, isFavorite, toggleFavorite, loading, error };
}
