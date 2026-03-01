"use client";

import { useCallback, useState } from "react";
import { notFound } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { usePreferences } from "@/lib/hooks/use-preferences";
import { getFavorites, removeFavorite } from "@/lib/services/favorites";
import {
  readLocalFavorites,
  readLocalPreferences,
  writeLocalFavorites,
  clearLocalFavorites,
  clearLocalPreferences,
  clearMergeGuard,
  isMergeDone,
  FAVORITES_KEY,
  PREFERENCES_KEY,
} from "@/lib/storage/stickiness";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LogEntry = { ts: string; msg: string; ok: boolean };

function ts() {
  return new Date().toISOString().slice(11, 23);
}

export default function StickinessDevPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    favorites,
    isFavorite,
    toggleFavorite,
    loading: favLoading,
    error: favError,
    refetch: refetchFavs,
  } = useFavorites();
  const {
    preferences,
    loading: prefLoading,
    error: prefError,
    refetch: refetchPrefs,
  } = usePreferences();

  const [log, setLog] = useState<LogEntry[]>([]);

  const pushLog = useCallback((msg: string, ok = true) => {
    setLog((prev) => [{ ts: ts(), msg, ok }, ...prev].slice(0, 50));
  }, []);

  // ------------------------------------------------------------------
  // Production guard
  // ------------------------------------------------------------------
  if (process.env.NODE_ENV !== "development") notFound();

  const userId = user?.id ?? null;

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------

  async function handleAddTestFavorites() {
    pushLog("Adding 3 test favorites...");
    const items = [
      { entityType: "team", entityId: "test-arsenal", label: "Arsenal FC" },
      { entityType: "league", entityId: "test-pl", label: "Premier League" },
      { entityType: "match", entityId: "test-999", label: "Test Match 999" },
    ];
    for (const item of items) {
      try {
        await toggleFavorite(item);
        pushLog(`  + ${item.label} toggled`);
      } catch (err) {
        pushLog(`  ! ${item.label} failed: ${err}`, false);
      }
    }
    pushLog("Done adding test favorites.");
  }

  async function handleRemoveAllFavorites() {
    pushLog("Removing all favorites...");
    if (userId) {
      try {
        const all = await getFavorites(userId);
        await Promise.allSettled(
          all.map((f) => removeFavorite(userId!, f.entity_type, f.entity_id))
        );
        pushLog(`Removed ${all.length} remote favorites`);
        refetchFavs();
      } catch (err) {
        pushLog(`Remote remove failed: ${err}`, false);
      }
    }
    clearLocalFavorites();
    pushLog("Cleared local favorites.");
    refetchFavs();
  }

  async function handleRapidToggle() {
    const input = { entityType: "match", entityId: "rapid-test", label: "Rapid Toggle Test" };
    pushLog("Rapid toggling 10x...");
    const results: string[] = [];
    for (let i = 0; i < 10; i++) {
      try {
        await toggleFavorite(input);
        results.push(`#${i + 1}: ok`);
      } catch {
        results.push(`#${i + 1}: skipped/error`);
      }
    }
    pushLog(`Results: ${results.join(", ")}`);
    pushLog(`Final state: isFavorite = ${isFavorite("match", "rapid-test")}`);
  }

  async function handleSimulateMerge() {
    if (!userId) {
      pushLog("Cannot merge: not logged in", false);
      return;
    }
    pushLog("Simulating merge (writing test local data then triggering)...");

    // Write some local test data
    writeLocalFavorites([
      {
        entity_type: "team",
        entity_id: "merge-test-1",
        label: "Merge Test Team",
        meta: {},
        created_at: new Date().toISOString(),
      },
    ]);

    // Clear the merge guard so it can run again
    clearMergeGuard();
    pushLog("Wrote 1 local fav, cleared merge guard. Reload the page to trigger StickinessSync.");
  }

  function handleClearLocalStorage() {
    clearLocalFavorites();
    clearLocalPreferences();
    clearMergeGuard();
    pushLog("Cleared all localStorage + sessionStorage stickiness keys.");
    refetchFavs();
    refetchPrefs();
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  const localFavs = readLocalFavorites();
  const localPrefs = readLocalPreferences();
  const mergeGuard = userId ? isMergeDone(userId) : "N/A (not logged in)";

  return (
    <main className="page-wrap">
      <h1>Stickiness Diagnostics</h1>
      <p className="muted">Dev-only page for validating favorites, preferences, and merge behavior.</p>

      <section className="cards-grid">
        {/* Auth status */}
        <Card title="Auth Status">
          <p>State: <strong>{authLoading ? "loading..." : userId ? "logged in" : "logged out"}</strong></p>
          {userId && <p className="muted">User ID: {userId}</p>}
          <p className="muted">Merge guard (sessionStorage): {String(mergeGuard)}</p>
        </Card>

        {/* Remote favorites (Supabase) */}
        <Card title={`Favorites (hook) — ${favorites.length} items`}>
          <p className="muted">Loading: {String(favLoading)} | Error: {favError ?? "none"}</p>
          {favorites.length === 0 ? (
            <p className="muted">Empty</p>
          ) : (
            <ul>
              {favorites.map((f) => (
                <li key={`${f.entity_type}:${f.entity_id}`}>
                  [{f.entity_type}] {f.label} ({f.entity_id})
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Local favorites */}
        <Card title={`localStorage Favorites — ${localFavs.length} items`}>
          <p className="muted">Key: {FAVORITES_KEY}</p>
          {localFavs.length === 0 ? (
            <p className="muted">Empty</p>
          ) : (
            <ul>
              {localFavs.map((f) => (
                <li key={`${f.entity_type}:${f.entity_id}`}>
                  [{f.entity_type}] {f.label} ({f.entity_id})
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Preferences (hook) */}
        <Card title="Preferences (hook)">
          <p className="muted">Loading: {String(prefLoading)} | Error: {prefError ?? "none"}</p>
          <ul>
            {Object.entries(preferences).map(([k, v]) => (
              <li key={k}>{k}: <strong>{String(v)}</strong></li>
            ))}
          </ul>
        </Card>

        {/* Local preferences */}
        <Card title="localStorage Preferences">
          <p className="muted">Key: {PREFERENCES_KEY}</p>
          <ul>
            {Object.entries(localPrefs).map(([k, v]) => (
              <li key={k}>{k}: <strong>{String(v)}</strong></li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Actions */}
      <Card title="Actions">
        <div className="controls" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <Button variant="primary" onClick={handleAddTestFavorites}>Add 3 test favorites</Button>
          <Button variant="muted" onClick={handleRemoveAllFavorites}>Remove all favorites</Button>
          <Button variant="muted" onClick={handleRapidToggle}>Rapid toggle 10x</Button>
          <Button variant="muted" onClick={handleSimulateMerge}>Simulate merge setup</Button>
          <Button variant="muted" onClick={handleClearLocalStorage}>Clear localStorage keys</Button>
          <Button variant="muted" onClick={() => { refetchFavs(); refetchPrefs(); pushLog("Refetched both hooks."); }}>
            Refetch all
          </Button>
        </div>
      </Card>

      {/* Log */}
      <Card title={`Log — ${log.length} entries`}>
        {log.length === 0 ? (
          <p className="muted">No actions yet. Press a button above.</p>
        ) : (
          <ul>
            {log.map((entry, i) => (
              <li key={i} style={{ color: entry.ok ? "var(--color-text-secondary)" : "var(--color-error, #ef4444)" }}>
                <code>{entry.ts}</code> {entry.msg}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}
