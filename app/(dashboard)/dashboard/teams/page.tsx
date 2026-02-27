import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { listMatches } from "@/lib/services/matches";

export default async function TeamsPage() {
  const feed = await listMatches();
  const teams = new Map<string, { league: string; form: string }>();

  feed.matches.forEach((match) => {
    teams.set(match.home.name, { league: match.league, form: match.home.form.recent });
    teams.set(match.away.name, { league: match.league, form: match.away.form.recent });
  });

  const sorted = Array.from(teams.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <main className="page-wrap">
      <PageHeader
        title="Teams"
        subtitle="Browse teams currently tracked in the match feed."
        meta={[`Teams tracked: ${sorted.length}`]}
        actions={
          <Link className="btn btn-muted" href="/dashboard">
            Back to dashboard
          </Link>
        }
      />

      <section className="cards-grid">
        {sorted.map(([name, value]) => (
          <Card key={name}>
            <h2>{name}</h2>
            <p className="muted">League: {value.league}</p>
            <p className="muted">Recent form: {value.form}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}
