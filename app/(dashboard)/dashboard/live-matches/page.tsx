import { MatchDirectoryPage } from "@/components/features/match-directory-page";

export default function LiveMatchesPage() {
  return (
    <MatchDirectoryPage
      title="Live Matches"
      subtitle="Current in-play matches with score and context."
      status="LIVE"
      variant="overview"
    />
  );
}
