"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WidgetsDemo } from "@/components/widgets/widgets-demo";
import { PageHeader } from "@/components/layout/page-header";
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
      <PageHeader
        title="Football Hub"
        subtitle="Leagues, matches, standings, and match detail in one focused layout."
        meta={[
          `Last updated: ${formatUpdatedAt(feed?.updatedAtISO)}`,
        ]}
        actions={
          <Link className="btn btn-muted" href="/dashboard">
            Back to dashboard
          </Link>
        }
      />
      {error ? <p className="muted">Update issue: {error}</p> : null}

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
