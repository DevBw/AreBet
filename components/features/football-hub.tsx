"use client";

import { useEffect, useState } from "react";
import { WidgetsDemo } from "@/components/widgets/widgets-demo";
import { listMatches } from "@/lib/services/matches";
import type { MatchFeed } from "@/types/match";

function formatUpdatedAt(value?: string) {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function FootballHub() {
  const [feed, setFeed] = useState<MatchFeed | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    async function load() {
      try {
        const data = await listMatches();
        setFeed(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load matches.");
      }
    }

    load();
    timer = setInterval(load, 60000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <main className="page-wrap">
      <section className="dashboard-head">
        <h1>Football Hub</h1>
        <p>Leagues, matches, standings, and match detail in one focused layout.</p>
        <div className="meta-row">
          <span className="meta-pill">Data: Live-style feed</span>
          <span className="meta-pill">Last updated: {formatUpdatedAt(feed?.updatedAtISO)}</span>
        </div>
        {error ? <p className="muted">Update issue: {error}</p> : null}
      </section>

      <section className="panel widgets-section">
        <h2>How to use this page</h2>
        <ul>
          <li>Select a league on the left.</li>
          <li>Pick a match in the middle to open the full detail.</li>
          <li>Standings stay visible on the right while you explore.</li>
        </ul>
      </section>

      <section className="widgets-section">
        <h2 className="widget-section-title">Live layout</h2>
        <p className="muted">This mirrors the final product flow for football fans.</p>
        {feed ? (
          <WidgetsDemo matches={feed.matches} updatedAtISO={feed.updatedAtISO} />
        ) : (
          <p className="muted">Loading matches...</p>
        )}
      </section>
    </main>
  );
}
