"use client";

import Link from "next/link";
import { WidgetsDemo } from "@/components/widgets/widgets-demo";
import { PageHeader } from "@/components/layout/page-header";
import { useMatchFeed } from "@/lib/hooks/use-match-feed";
import { formatTime } from "@/lib/utils/time";

export function FootballHub() {
  const { feed, error } = useMatchFeed({ pollIntervalMs: 60000 });

  return (
    <main className="page-wrap">
      <PageHeader
        title="Football Hub"
        subtitle="Leagues, matches, standings, and match detail in one focused layout."
        meta={[
          `Last updated: ${formatTime(feed?.updatedAtISO)}`,
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
