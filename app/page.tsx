import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listMatches } from "@/lib/services/matches";
import type { Match } from "@/types/match";

function kickoffTime(match: Match) {
  return new Date(match.kickoffISO).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default async function HomePage() {
  const feed = await listMatches();
  const matches = feed.matches;

  const live = matches.filter((m) => m.status === "LIVE").length;
  const upcoming = matches.filter((m) => m.status === "UPCOMING").length;
  const topConfidence = matches.length ? Math.max(...matches.map((m) => m.prediction.confidence)) : 0;
  const topPicks = [...matches]
    .sort((a, b) => b.prediction.confidence - a.prediction.confidence)
    .slice(0, 4);

  return (
    <main className="page-wrap">
      <section className="dashboard-head">
        <h1>AreBet Match Board</h1>
        <p>Live-style decision board as the default landing experience.</p>
        <div className="meta-row">
          <span className="meta-pill">Source: {feed.source === "demo" ? "Demo Data" : "Live API"}</span>
          <span className="meta-pill">Last updated: {new Date(feed.updatedAtISO).toLocaleTimeString()}</span>
        </div>
      </section>

      <section className="kpi-strip" aria-label="Board KPIs">
        <article className="kpi">
          <span className="kpi-label">Live Matches</span>
          <strong>{live}</strong>
        </article>
        <article className="kpi">
          <span className="kpi-label">Upcoming</span>
          <strong>{upcoming}</strong>
        </article>
        <article className="kpi">
          <span className="kpi-label">Top Confidence</span>
          <strong>{topConfidence}%</strong>
        </article>
      </section>

      <section className="cards-grid" aria-label="Top opportunities">
        {topPicks.map((match) => (
          <Card className="match-card" key={match.id}>
            <div className="match-row">
              <p className="match-league">
                {match.league} • {match.country}
              </p>
              <Badge tone={match.status.toLowerCase() as "live" | "upcoming" | "finished"}>
                {match.status === "LIVE" && match.minute ? `LIVE ${match.minute}'` : match.status}
              </Badge>
            </div>
            <h2>
              {match.home.name} vs {match.away.name}
            </h2>
            <div className="match-row">
              <strong className="score">
                {match.score.home}-{match.score.away}
              </strong>
              <span className="confidence">{match.prediction.confidence}% confidence</span>
            </div>
            <p className="match-advice">{match.prediction.advice}</p>
            <p className="muted">Kickoff: {kickoffTime(match)}</p>
            <Link href={`/dashboard/match/${match.id}`} className="detail-link">
              Open detailed analysis
            </Link>
          </Card>
        ))}
      </section>

      <section className="quick-links" aria-label="Board actions">
        <Link href="/dashboard">Open full dashboard</Link>
        <Link href="/dashboard?status=LIVE">Focus on live matches</Link>
      </section>
    </main>
  );
}
