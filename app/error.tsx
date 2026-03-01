"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-wrap">
      <ErrorState
        title="Something went wrong"
        description={error.message || "An unexpected error occurred."}
        retry={reset}
        backHref="/"
        backLabel="Go home"
      />
    </main>
  );
}
