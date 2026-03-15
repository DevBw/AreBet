import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { MatchDetailTabs } from "@/components/features/match-detail-tabs";
import { getMatchById } from "@/lib/services/matches";
import { formatTime } from "@/lib/utils/time";

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
      <PageHeader
        title={`${match.home.name} vs ${match.away.name}`}
        subtitle={`${match.league} · ${match.country} · ${match.venue}`}
        meta={[`Updated: ${formatTime(result.updatedAtISO)}`]}
        actions={
          <Link className="btn btn-muted" href="/">
            ← Back
          </Link>
        }
      />

      <MatchDetailTabs match={match} />
    </main>
  );
}
