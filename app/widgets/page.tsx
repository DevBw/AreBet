import { WidgetsDemo } from "@/components/widgets/widgets-demo";
import { getDemoMatchFeed } from "@/lib/demo/matches";

export default function WidgetsPage() {
  const feed = getDemoMatchFeed();

  return (
    <main className="page-wrap">
      <section className="dashboard-head">
        <h1>Football Widgets</h1>
        <p>Modular match widgets that feel native across the product.</p>
        <div className="meta-row">
          <span className="meta-pill">Data: Live-style feed</span>
          <span className="meta-pill">Last updated: {new Date(feed.updatedAtISO).toLocaleTimeString()}</span>
        </div>
      </section>

      <section className="panel widgets-section">
        <h2>Why this matters</h2>
        <ul>
          <li>Each widget is focused, fast, and purpose-built for match days.</li>
          <li>The layout stays consistent across the dashboard and the match detail view.</li>
          <li>Fans can move from scores to context to decisions without switching screens.</li>
        </ul>
      </section>

      <section className="widgets-section">
        <h2 className="widget-section-title">Widgets preview</h2>
        <p className="muted">A preview of the match widgets as they appear to end users.</p>
        <WidgetsDemo matches={feed.matches} updatedAtISO={feed.updatedAtISO} />
      </section>
    </main>
  );
}
