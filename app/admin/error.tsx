"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-wrap">
      <ErrorState
        title="Admin error"
        description={error.message || "Could not load the admin panel."}
        retry={reset}
        backHref="/"
        backLabel="Back to home"
      />
    </main>
  );
}
