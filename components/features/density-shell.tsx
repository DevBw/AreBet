"use client";

import { usePreferences } from "@/lib/hooks/use-preferences";

type DensityShellProps = {
  children: React.ReactNode;
};

export function DensityShell({ children }: DensityShellProps) {
  const { preferences } = usePreferences();

  return (
    <div className="site-shell" data-density={preferences.density}>
      {children}
    </div>
  );
}
