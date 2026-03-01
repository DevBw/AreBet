"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/context";
import { addFavorite } from "@/lib/services/favorites";
import { getPreferences, updatePreferences } from "@/lib/services/preferences";
import {
  readLocalFavorites,
  readLocalPreferences,
  clearLocalFavorites,
  clearLocalPreferences,
  isMergeDone,
  markMergeDone,
  mergePreferences,
  normalizeFavorite,
} from "@/lib/storage/stickiness";

/**
 * Mounts globally. When user transitions from logged-out → logged-in,
 * merges local favorites/preferences into Supabase, then clears local keys.
 *
 * Guard: uses sessionStorage so merge runs at most once per tab per user,
 * and does NOT re-run on page refresh within the same session.
 */
export function StickinessSync() {
  const { user } = useAuth();
  const merging = useRef(false);

  useEffect(() => {
    const currentId = user?.id ?? null;

    // No user, or merge already done for this user in this session
    if (!currentId || merging.current || isMergeDone(currentId)) return;

    merging.current = true;

    async function merge() {
      try {
        // ---- Favorites ----
        const localFavs = readLocalFavorites().map(normalizeFavorite);
        if (localFavs.length > 0) {
          // Upsert each local favorite (duplicates ignored by unique constraint)
          await Promise.allSettled(
            localFavs.map((f) =>
              addFavorite(currentId!, {
                entityType: f.entity_type,
                entityId: f.entity_id,
                label: f.label,
                meta: f.meta,
              })
            )
          );
          clearLocalFavorites();
        }

        // ---- Preferences ----
        const localPrefs = readLocalPreferences();
        const remotePrefs = await getPreferences(currentId!);
        const { result, strategy } = mergePreferences(localPrefs, remotePrefs);

        if (strategy === "local_seeds_remote") {
          await updatePreferences(currentId!, result);
        }
        clearLocalPreferences();

        // Mark merge done in sessionStorage so it won't repeat
        markMergeDone(currentId!);
      } catch {
        // Non-critical — user can re-sync next session
      } finally {
        merging.current = false;
      }
    }

    merge();
  }, [user]);

  return null;
}
