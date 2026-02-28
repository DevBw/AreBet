import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listMatches } from "@/lib/services/matches";
import { formatTime } from "@/lib/utils/time";
import type { Match, MatchStatus } from "@/types/match";

type Variant = "overview" | "predictions" | "odds";

type MatchDirectoryPageProps = {
  title: string;
  subtitle: string;
  status?: MatchStatus;
  variant?: Variant;
};

function kickoffTime(match: Match) {
  return formatTime(match.kickoffISO);
}

function sortMatches(matches: Match[], variant: Variant) {
  const data = [...matches];
  if (variant === "odds") {
    return data.sort((a, b) => a.odds.home - b.odds.home);
  }
  return data.sort((a, b) => b.prediction.confidence - a.prediction.confidence);
}

export async function MatchDirectoryPage({
  title,
  subtitle,
  status,
  variant = "overview",
}: MatchDirectoryPageProps) {
  const feed = await listMatches();
  const filtered = status ? feed.matches.filter((match) => match.status === status) : feed.matches;
  const matches = sortMatches(filtered, variant);

  return (
    <main className="page-wrap">
      <PageHeader
        title={title}
        subtitle={subtitle}
        meta={["Data: Live-style feed", `Last updated: ${formatTime(feed.updatedAtISO)}`]}
        actions={
          <Link className="btn btn-muted" href="/dashboard">
            Back to dashboard
          </Link>
        }
      />

      <section className="cards-grid" aria-label={title}>
        {matches.map((match) => (
          <Card className="match-card" key={match.id}>
            <div className="match-row">
              <p className="match-league">
                {match.league} | {match.country}
              </p>
              <Badge tone={match.status.toLowerCase() as "live" | "upcoming" | "finished"}>
                {match.status === "LIVE" && match.minute ? `LIVE ${match.minute}'` : match.status}
              </Badge>
            </div>
            <h2>
              {match.home.name} vs {match.away.name}
            </h2>
            <p className="match-meta">
              <span>Kickoff: {kickoffTime(match)}</span>
              <span>
                Score {match.score.home}-{match.score.away}
              </span>
            </p>

            {variant === "predictions" ? (
              <>
                <p className="confidence">{match.prediction.confidence}% confidence</p>
                <p className="match-advice">{match.prediction.advice}</p>
              </>
            ) : null}

            {variant === "odds" ? (
              <ul>
                <li>Home: {match.odds.home.toFixed(2)}</li>
                <li>Draw: {match.odds.draw.toFixed(2)}</li>
                <li>Away: {match.odds.away.toFixed(2)}</li>
              </ul>
            ) : null}

            {variant === "overview" ? <p className="match-advice">{match.prediction.advice}</p> : null}

            <Link href={`/dashboard/match/${match.id}`} className="detail-link">
              View full match detail
            </Link>
          </Card>
        ))}
      </section>

      {!matches.length ? (
        <Card className="empty-state">
          <h2>No matches available</h2>
          <p>There are no matches in this section yet.</p>
        </Card>
      ) : null}
    </main>
  );
}
