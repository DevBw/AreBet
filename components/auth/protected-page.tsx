"use client";

import { useRequireAuth } from "@/lib/auth/hooks";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
