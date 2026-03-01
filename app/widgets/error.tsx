"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function WidgetsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-wrap">
      <ErrorState
        title="Football Hub error"
        description={error.message || "Could not load the Football Hub."}
        retry={reset}
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
    </main>
  );
}
