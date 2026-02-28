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
  DEFAULT_PREFERENCES,
} from "@/lib/storage/stickiness";

/**
 * Mounts globally. When user transitions from logged-out → logged-in,
 * merges local favorites/preferences into Supabase, then clears local keys.
 */
export function StickinessSync() {
  const { user } = useAuth();
  const prevUserRef = useRef<string | null>(null);
  const merging = useRef(false);

  useEffect(() => {
    const currentId = user?.id ?? null;
    const prevId = prevUserRef.current;
    prevUserRef.current = currentId;

    // Only merge when transitioning from no-user to user
    if (!currentId || prevId === currentId || merging.current) return;

    merging.current = true;

    async function merge() {
      try {
        // ---- Favorites ----
        const localFavs = readLocalFavorites();
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
        const isLocalDefault =
          JSON.stringify(localPrefs) === JSON.stringify(DEFAULT_PREFERENCES);

        if (!isLocalDefault) {
          // Check if remote has custom prefs already
          const remotePrefs = await getPreferences(currentId!);
          const isRemoteDefault =
            JSON.stringify(remotePrefs) === JSON.stringify(DEFAULT_PREFERENCES);

          if (isRemoteDefault) {
            // Remote is default → seed with local
            await updatePreferences(currentId!, localPrefs);
          }
          // If remote has custom prefs, remote wins — don't overwrite
        }
        clearLocalPreferences();
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
