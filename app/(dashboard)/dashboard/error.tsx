"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-wrap">
      <ErrorState
        title="Dashboard error"
        description={error.message || "Could not load this section."}
        retry={reset}
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
    </main>
  );
}
