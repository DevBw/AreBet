import { MatchDirectoryPage } from "@/components/features/match-directory-page";

export default function PredictionsPage() {
  return (
    <MatchDirectoryPage
      title="Predictions"
      subtitle="Confidence-based match guidance ranked by strongest signal."
      variant="predictions"
    />
  );
}
