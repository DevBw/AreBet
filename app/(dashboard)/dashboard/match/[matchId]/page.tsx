import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getMatchById } from "@/lib/services/matches";

type Props = {
  params: Promise<{ matchId: string }>;
};

export default async function MatchDetailPage({ params }: Props) {
  const { matchId } = await params;
  const parsedId = Number(matchId);
  if (Number.isNaN(parsedId)) notFound();

  const result = await getMatchById(parsedId);
  if (!result.match) notFound();

  const match = result.match;

  return (
    <main className="page-wrap">
      <section className="dashboard-head">
        <h1>
          {match.home.name} vs {match.away.name}
        </h1>
        <p>
          {match.league} | {match.country} | {match.venue}
        </p>
        <div className="meta-row">
          <span className="meta-pill">Data: Live-style feed</span>
          <span className="meta-pill">Last updated: {new Date(result.updatedAtISO).toLocaleTimeString()}</span>
        </div>
      </section>

      <section className="cards-grid">
        <Card title="Prediction">
          <p className="price">{match.prediction.confidence}% confidence</p>
          <p className="muted">{match.prediction.advice}</p>
          <p className="muted">Expected goals: {match.prediction.expectedGoals.toFixed(1)}</p>
        </Card>
        <Card title="Market Snapshot">
          <ul>
            <li>Home: {match.odds.home.toFixed(2)}</li>
            <li>Draw: {match.odds.draw.toFixed(2)}</li>
            <li>Away: {match.odds.away.toFixed(2)}</li>
            <li>Over 2.5: {match.odds.over25.toFixed(2)}</li>
            <li>BTTS: {match.odds.btts.toFixed(2)}</li>
          </ul>
        </Card>
        <Card title="Form Context">
          <p className="muted">
            {match.home.short} form: {match.home.form.recent} (GF {match.home.form.goalsFor} / GA {match.home.form.goalsAgainst})
          </p>
          <p className="muted">
            {match.away.short} form: {match.away.form.recent} (GF {match.away.form.goalsFor} / GA {match.away.form.goalsAgainst})
          </p>
        </Card>
      </section>

      <Card title="Match Timeline" className="timeline-card">
        {match.events.length ? (
          <ul className="timeline">
            {match.events.map((event) => (
              <li key={`${event.minute}-${event.player}-${event.type}`}>
                <span className="timeline-minute">{event.minute}'</span>
                <span className="timeline-body">
                  <strong>{event.type}</strong> | {event.team} | {event.player} | {event.detail}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No events yet.</p>
        )}
      </Card>

      <section className="quick-links">
        <Link href="/dashboard">Back to Dashboard</Link>
      </section>
    </main>
  );
}
