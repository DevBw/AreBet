import { WidgetsDemo } from "@/components/widgets/widgets-demo";
import { getDemoMatchFeed } from "@/lib/demo/matches";

const CONFIG_SNIPPET = `<script type="module" src="https://widgets.api-sports.io/3.1.0/widgets.js"></script>

<api-sports-widget
  data-type="config"
  data-key="Your-Api-Key-Here"
  data-sport="football"
  data-lang="en"
  data-theme="white"
  data-target-game="#details"
></api-sports-widget>`;

const GAMES_SNIPPET = `<api-sports-widget
  data-type="games"
  data-date="2026-02-24"
  data-refresh="30"
  data-tab="live"
></api-sports-widget>`;

export default function WidgetsPage() {
  const feed = getDemoMatchFeed();

  return (
    <main className="page-wrap">
      <section className="dashboard-head">
        <h1>API-SPORTS Football Widgets (Demo Mode)</h1>
        <p>Recreating the API-FOOTBALL widget experience using demo data so you can shape the UI now and plug in the API later.</p>
        <div className="meta-row">
          <span className="meta-pill">Source: {feed.source === "demo" ? "Demo Data" : "Live API"}</span>
          <span className="meta-pill">Last updated: {new Date(feed.updatedAtISO).toLocaleTimeString()}</span>
        </div>
      </section>

      <section className="panel widgets-section">
        <h2>Build a football site in minutes</h2>
        <ul>
          <li>Ultra-modular: each widget is self-contained.</li>
          <li>Customisable: language, theme, content, behavior.</li>
          <li>Easy to integrate: just drop an HTML tag where you want it.</li>
          <li>Compatible with free plans and all paid plans.</li>
        </ul>
      </section>

      <section className="widgets-section">
        <div className="widgets-two-col">
          <article className="widget-card">
            <h3 className="widget-title">1) Add the widget script</h3>
            <p className="widget-meta">This loads the web components for games, league, standings, and more.</p>
            <pre className="widget-code">
              <code>{`<script type="module" src="https://widgets.api-sports.io/3.1.0/widgets.js"></script>`}</code>
            </pre>
          </article>

          <article className="widget-card">
            <h3 className="widget-title">2) Configure once</h3>
            <p className="widget-meta">Set your API key, language, theme, and targeting for all widgets.</p>
            <pre className="widget-code">
              <code>{CONFIG_SNIPPET}</code>
            </pre>
          </article>

          <article className="widget-card">
            <h3 className="widget-title">3) Drop in widgets</h3>
            <p className="widget-meta">Each widget inherits the global config but can override it locally.</p>
            <pre className="widget-code">
              <code>{GAMES_SNIPPET}</code>
            </pre>
          </article>

          <article className="widget-card">
            <h3 className="widget-title">Debugging and errors</h3>
            <p className="widget-meta">
              If a widget renders empty in production, enable `data-show-errors="true"` to see issues like quota limits or invalid tags.
            </p>
            <p className="widget-meta">Demo mode does not expose an API key.</p>
          </article>
        </div>
      </section>

      <section className="panel widgets-section">
        <h2>Security and caching notes</h2>
        <ul>
          <li>API keys are visible in HTML. Restrict usage to approved domains or IPs in your API-SPORTS dashboard.</li>
          <li>For full secrecy, proxy widget requests through your server or a dedicated key-hiding setup.</li>
          <li>Without caching, high traffic can burn your daily quota. With a 60s cache, 115,200 requests drop to about 1,440 per day.</li>
          <li>Logos and images are free but still rate-limited. Use a CDN to avoid delays.</li>
        </ul>
      </section>

      <section className="panel widgets-section">
        <h2>Logo and trademark notice</h2>
        <p className="muted">
          Logos and images are provided only for identification. They may be owned by leagues, clubs, or federations. Usage may require
          permission from rights holders, and you remain responsible for compliance in your regions.
        </p>
      </section>

      <section className="widgets-section">
        <h2 className="widget-section-title">Widgets preview (demo data)</h2>
        <p className="muted">
          The widgets below mimic the API-FOOTBALL components using demo data. When you switch to the live API, these same layouts can be
          powered by real widgets.
        </p>
        <WidgetsDemo matches={feed.matches} updatedAtISO={feed.updatedAtISO} />
      </section>
    </main>
  );
}
