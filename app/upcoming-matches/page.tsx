import { MatchDirectoryPage } from "@/components/features/match-directory-page";

export default function UpcomingMatchesPage() {
  return (
    <MatchDirectoryPage
      title="Upcoming Matches"
      subtitle="Next fixtures to plan and track before kickoff."
      status="UPCOMING"
      variant="overview"
    />
  );
}
