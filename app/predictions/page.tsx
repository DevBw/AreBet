"use client";

import { useState } from "react";
import { MatchDirectoryPage } from "@/components/features/match-directory-page";
import { PredictionTracker } from "@/components/features/prediction-tracker";
import { PageHeader } from "@/components/layout/page-header";

type Tab = "guidance" | "tracker";

export default function PredictionsPage() {
  const [tab, setTab] = useState<Tab>("guidance");

  return (
    <>
      {/* Tab bar — always visible above content */}
      <div className="page-tabs-bar">
        <button
          type="button"
          className={`page-tab${tab === "guidance" ? " is-active" : ""}`}
          onClick={() => setTab("guidance")}
        >
          AI Guidance
        </button>
        <button
          type="button"
          className={`page-tab${tab === "tracker" ? " is-active" : ""}`}
          onClick={() => setTab("tracker")}
        >
          My Tracker
        </button>
      </div>

      {tab === "guidance" ? (
        <MatchDirectoryPage
          title="Predictions"
          subtitle="Confidence-based match guidance ranked by strongest signal."
          variant="predictions"
        />
      ) : (
        <div className="page-wrap">
          <PageHeader
            title="My Tracker"
            subtitle="Track your picks — mark results and measure accuracy over time."
          />
          <PredictionTracker />
        </div>
      )}
    </>
  );
}
