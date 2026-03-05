import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listMatches } from "@/lib/services/matches";
import { statusLabel, statusTone, confTier } from "@/lib/utils/match-status";
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
          <Link className="btn btn-muted" href="/">
            Back to home
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
              <Badge tone={statusTone(match)}>
                {statusLabel(match)}
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
                <p>
                  <span className={`conf-heat conf-heat--${confTier(match.prediction.confidence)}`}>
                    {match.prediction.confidence}%
                  </span>{" "}
                  confidence
                </p>
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

            <Link href={`/match/${match.id}`} className="detail-link">
              View full match detail
            </Link>
          </Card>
        ))}
      </section>

      {!matches.length ? (
        <EmptyState
          title={status === "LIVE" ? "No live matches right now" : "No matches available"}
          description={
            status === "LIVE"
              ? "Check back when fixtures are in play, or browse upcoming matches."
              : "There are no matches in this section yet."
          }
          action={
            status === "LIVE"
              ? { label: "View upcoming", href: "/upcoming-matches" }
              : { label: "Back to home", href: "/" }
          }
        />
      ) : null}
    </main>
  );
}
