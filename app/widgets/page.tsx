import { WidgetsDemo } from "@/components/widgets/widgets-demo";
import { getDemoMatchFeed } from "@/lib/demo/matches";

export default function WidgetsPage() {
  const feed = getDemoMatchFeed();

  return (
    <main className="page-wrap">
      <section className="dashboard-head">
        <h1>Football Hub</h1>
        <p>Leagues, matches, standings, and match detail in one focused layout.</p>
        <div className="meta-row">
          <span className="meta-pill">Data: Live-style feed</span>
          <span className="meta-pill">Last updated: {new Date(feed.updatedAtISO).toLocaleTimeString()}</span>
        </div>
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
        <WidgetsDemo matches={feed.matches} updatedAtISO={feed.updatedAtISO} />
      </section>
    </main>
  );
}
