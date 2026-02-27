import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getMatchById } from "@/lib/services/matches";
import { StatBar } from "@/components/analytics/stat-bar";
import { OddsComparison } from "@/components/analytics/odds-comparison";

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

  // Sample odds comparison data
  const oddsData = [
    { bookmaker: "Bet365", home: match.odds.home + 0.05, draw: match.odds.draw, away: match.odds.away - 0.05 },
    { bookmaker: "Betway", home: match.odds.home, draw: match.odds.draw + 0.10, away: match.odds.away },
    { bookmaker: "1xBet", home: match.odds.home - 0.03, draw: match.odds.draw - 0.05, away: match.odds.away + 0.08 },
    { bookmaker: "William Hill", home: match.odds.home + 0.02, draw: match.odds.draw, away: match.odds.away + 0.03 },
  ];

  return (
    <main className="page-wrap">
      <PageHeader
        title={`${match.home.name} vs ${match.away.name}`}
        subtitle={`${match.league} | ${match.country} | ${match.venue}`}
        meta={[
          `Last updated: ${new Date(result.updatedAtISO).toLocaleTimeString()}`,
        ]}
        actions={
          <Link className="btn btn-muted" href="/dashboard">
            Back to dashboard
          </Link>
        }
      />

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
          <div className="stat-bar-container">
            <StatBar
              label="Goals Scored (Last 5)"
              home={match.home.form.goalsFor}
              away={match.away.form.goalsFor}
              homeLabel={match.home.short}
              awayLabel={match.away.short}
            />
            <StatBar
              label="Goals Conceded (Last 5)"
              home={match.home.form.goalsAgainst}
              away={match.away.form.goalsAgainst}
              homeLabel={match.home.short}
              awayLabel={match.away.short}
            />
          </div>
          <div style={{ marginTop: "1rem" }}>
            <p className="muted">
              {match.home.short}: {match.home.form.recent}
            </p>
            <p className="muted">
              {match.away.short}: {match.away.form.recent}
            </p>
          </div>
        </Card>
      </section>

      <Card title="Odds Comparison">
        <p className="muted" style={{ marginBottom: "1rem" }}>
          Compare odds across major bookmakers to find the best value. Higher odds = better potential return.
        </p>
        <OddsComparison odds={oddsData} homeTeam={match.home.short} awayTeam={match.away.short} />
      </Card>

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
