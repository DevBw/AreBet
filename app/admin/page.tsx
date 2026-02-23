"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

type Flags = {
  compactCards: boolean;
  quickOddsCompare: boolean;
  highlightHighConfidence: boolean;
  demoMode: boolean;
};

const FLAGS_KEY = "arebet.demo.flags";

export default function AdminPage() {
  const [flags, setFlags] = useState<Flags>({
    compactCards: false,
    quickOddsCompare: true,
    highlightHighConfidence: true,
    demoMode: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem(FLAGS_KEY);
    if (saved) {
      setFlags(JSON.parse(saved) as Flags);
    }
  }, []);

  function toggleFlag(flag: keyof Flags) {
    setFlags((prev) => {
      const next = { ...prev, [flag]: !prev[flag] };
      localStorage.setItem(FLAGS_KEY, JSON.stringify(next));
      return next;
    });
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
          <label className="flag-item">
            <span>Demo mode enabled</span>
            <input type="checkbox" checked={flags.demoMode} onChange={() => toggleFlag("demoMode")} />
          </label>
        </div>
        <p className="muted">Flags are saved in local storage for UI validation sessions.</p>
      </Card>
    </main>
  );
}
