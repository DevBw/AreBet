import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

const LEAGUE_STANDINGS = {
  "Premier League": [
    { rank: 1, team: "Arsenal", points: 61, form: "WWDWW" },
    { rank: 2, team: "Liverpool", points: 58, form: "WWWWW" },
    { rank: 3, team: "Man City", points: 56, form: "WDWWW" },
  ],
  "La Liga": [
    { rank: 1, team: "Barcelona", points: 57, form: "WWDWW" },
    { rank: 2, team: "Real Madrid", points: 55, form: "WWWDD" },
    { rank: 3, team: "Girona", points: 52, form: "WWLDW" },
  ],
  "Serie A": [
    { rank: 1, team: "Inter", points: 60, form: "WWWWW" },
    { rank: 2, team: "Milan", points: 54, form: "WWDWL" },
    { rank: 3, team: "Juventus", points: 53, form: "WDLWW" },
  ],
};

export default function StandingsPage() {
  return (
    <main className="page-wrap">
      <PageHeader
        title="Standings"
        subtitle="Current league table snapshots."
        actions={
          <Link className="btn btn-muted" href="/dashboard">
            Back to dashboard
          </Link>
        }
      />

      <section className="cards-grid">
        {Object.entries(LEAGUE_STANDINGS).map(([league, table]) => (
          <Card key={league} title={league}>
            <ul>
              {table.map((row) => (
                <li key={row.team}>
                  {row.rank}. {row.team} | {row.points} pts | {row.form}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>
    </main>
  );
}
