"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

type Flags = {
  compactCards: boolean;
  quickOddsCompare: boolean;
  highlightHighConfidence: boolean;
};

export default function AdminPage() {
  const [flags, setFlags] = useState<Flags>({
    compactCards: false,
    quickOddsCompare: true,
    highlightHighConfidence: true,
  });

  function toggleFlag(flag: keyof Flags) {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }

  return (
    <main className="page-wrap">
      <Card>
        <h1>Admin Console</h1>
        <p className="muted">Feature controls for front-end behavior and visual presentation.</p>
        <div className="flag-list">
          <label className="flag-item">
            <span>Compact match cards</span>
            <input type="checkbox" checked={flags.compactCards} onChange={() => toggleFlag("compactCards")} />
          </label>
          <label className="flag-item">
            <span>Quick odds comparison panel</span>
            <input type="checkbox" checked={flags.quickOddsCompare} onChange={() => toggleFlag("quickOddsCompare")} />
          </label>
          <label className="flag-item">
            <span>Highlight high-confidence picks</span>
            <input type="checkbox" checked={flags.highlightHighConfidence} onChange={() => toggleFlag("highlightHighConfidence")} />
          </label>
        </div>
      </Card>
    </main>
  );
}
