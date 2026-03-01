"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-wrap">
      <ErrorState
        title="Account error"
        description={error.message || "Could not load your account."}
        retry={reset}
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
    </main>
  );
}
