"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { SelectField } from "@/components/ui/select-field";
import { TextInput } from "@/components/ui/text-input";
import { PageHeader } from "@/components/layout/page-header";
import { buildInsightBundle, scenarioSuggestion } from "@/lib/insights/engine";
import { DEMO_BANKROLL, DEMO_BETS } from "@/lib/demo/bets";
import { ValueEdgeChart } from "@/components/analytics/value-edge-chart";
import { PerformanceChart } from "@/components/analytics/performance-chart";
import { TrendIndicator } from "@/components/analytics/trend-indicator";
import { useMatchFeed } from "@/lib/hooks/use-match-feed";

export default function InsightsPage() {
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [minute, setMinute] = useState("70");
  const [goalDiff, setGoalDiff] = useState("0");
  const { matches, loading, error, reload } = useMatchFeed();
  const activeMatchId = selectedMatchId || (matches[0] ? String(matches[0].id) : "");

  const insights = useMemo(() => buildInsightBundle(matches, DEMO_BETS, DEMO_BANKROLL), [matches]);
  const selectedMatch = useMemo(
    () => matches.find((item) => item.id === Number(activeMatchId)),
    [matches, activeMatchId]
  );
  const scenarioText = selectedMatch
    ? scenarioSuggestion(selectedMatch, Number(minute) || 0, Number(goalDiff) || 0)
    : "Select a match to simulate.";

  // Sample performance trend data
  const performanceData = [
    { period: "Week 1", roi: 5.2, winRate: 55, clv: 1.8 },
    { period: "Week 2", roi: 8.5, winRate: 58, clv: 2.1 },
    { period: "Week 3", roi: 6.1, winRate: 52, clv: 1.5 },
    { period: "Week 4", roi: 12.4, winRate: 61, clv: 2.7 },
    { period: "Week 5", roi: 9.8, winRate: 58, clv: 2.3 },
    { period: "Week 6", roi: 11.2, winRate: 60, clv: 2.9 },
  ];

  return (
    <main className="page-wrap">
      <PageHeader
        title="Insights"
        subtitle="Plain-language guidance to explain what the numbers are saying."
      />

      {loading ? (
        <SkeletonList rows={3} />
      ) : error ? (
        <ErrorState
          title="Could not load insights"
          description={error}
          retry={reload}
          backHref="/"
          backLabel="Back to home"
        />
      ) : (
      <>
      <section className="cards-grid">
        <Card title="1) Is this price fair?">
          <p className="muted">
            We compare our model view vs market price. Positive edge means the market may be undervaluing that outcome.
          </p>
          <ValueEdgeChart data={insights.valueEdges} />
          <div className="mt-4">
            <p className="muted mb-2 text-strong">
              Top Value Opportunities:
            </p>
            <ul>
              {insights.valueEdges.slice(0, 5).map((edge) => (
                <li key={`${edge.matchId}-${edge.market}`}>
                  Match {edge.matchId} {edge.market}:{" "}
                  <span className="value-positive">+{edge.edgePct}% edge</span> (model {edge.modelProbability}% vs market{" "}
                  {edge.impliedProbability}%)
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </section>

      <section className="cards-grid">

        <Card title="2) Are prices moving?">
          <p className="muted">Track if prices are rising or falling during the day.</p>
          <ul>
            {insights.marketMoves.slice(0, 5).map((move) => (
              <li key={`${move.matchId}-${move.market}`}>
                Match {move.matchId} {move.market}: {move.openOdds} to {move.currentOdds} ({move.driftPct}%)
              </li>
            ))}
          </ul>
        </Card>

        <Card title="3) Did we beat the final price?" className="panel-accent">
          <p className="muted">
            If your chosen price is better than the final market close, that is a strong long-term signal.
          </p>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Average CLV Edge</div>
              <div className="stat-value">
                <TrendIndicator value={insights.clv.avgCLVEdgePct} />
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Beat Closing %</div>
              <div className="stat-value text-accent">
                {insights.clv.positiveCLVPct}%
              </div>
            </div>
          </div>
          <p className="card-hint">
            <strong>Pro Tip:</strong> Consistent positive CLV is the best predictor of long-term profitability.
          </p>
        </Card>
      </section>

      <section className="cards-grid">
        <Card title="4) Are we overexposed?">
          <p className="muted">Total active stake: {insights.portfolio.totalStake}</p>
          <p className="muted">Share of bankroll at risk: {insights.portfolio.stakePctOfBankroll}%</p>
          <p className="muted">Concentration risk: {insights.portfolio.correlationRisk}</p>
        </Card>

        <Card title="5) Where do we perform best?">
          <p className="muted">Best leagues so far:</p>
          <ul>
            {insights.personalization.strongestLeagues.map((item) => (
              <li key={item.key}>
                {item.key}: ROI {item.roiPct}% ({item.bets} bets)
              </li>
            ))}
          </ul>
          <p className="muted">Best market types so far:</p>
          <ul>
            {insights.personalization.strongestMarkets.map((item) => (
              <li key={item.key}>
                {item.key}: ROI {item.roiPct}% ({item.bets} bets)
              </li>
            ))}
          </ul>
        </Card>

        <Card title="6) Is there a guaranteed-price gap?">
          <p className="muted">
            Looks for rare situations where combining best prices may reduce risk to near zero.
          </p>
          {insights.arbitrage.length ? (
            <ul>
              {insights.arbitrage.map((arb) => (
                <li key={arb.matchId}>
                  Match {arb.matchId}: overround {arb.overroundPct}% (H {arb.bestHome}, D {arb.bestDraw}, A {arb.bestAway})
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No current arbitrage right now.</p>
          )}
        </Card>
      </section>

      <section className="cards-grid">
        <Card title="7) What should we do if the game changes?">
          <p className="muted">Enter game state and get a simple suggested action.</p>
          <SelectField
            label="Match"
            value={activeMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            options={matches.map((m) => ({ label: `${m.home.short} vs ${m.away.short}`, value: String(m.id) }))}
          />
          <TextInput
            label="Minute"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            placeholder="e.g. 70"
          />
          <TextInput
            label="Goal Diff (home-away)"
            value={goalDiff}
            onChange={(e) => setGoalDiff(e.target.value)}
            placeholder="-1, 0, 1"
          />
          <p className="match-advice">{scenarioText}</p>
        </Card>

        <Card title="8) Why is this prediction high or low?">
          <p className="muted">Short reasons behind each model output.</p>
          <ul>
            {insights.explainability.slice(0, 3).map((item) => (
              <li key={item.matchId}>
                Match {item.matchId}: {item.reasons.join(" ")}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="9) What are we learning from results?">
          <p className="muted">Performance by league:</p>
          <ul>
            {insights.postMatch.byLeague.map((item) => (
              <li key={item.key}>
                {item.key}: ROI {item.roiPct}% (W {item.wins} / L {item.losses})
              </li>
            ))}
          </ul>
          <p className="muted">Performance by market type:</p>
          <ul>
            {insights.postMatch.byMarket.map((item) => (
              <li key={item.key}>
                {item.key}: ROI {item.roiPct}% (W {item.wins} / L {item.losses})
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="cards-grid">
        <Card title="10) Can we trust these numbers?">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Tracked Bets</div>
              <div className="stat-value">{insights.trust.sampleSize}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value">{insights.trust.hitRatePct}%</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">ROI</div>
              <div className="stat-value">
                <TrendIndicator value={insights.trust.roiPct} />
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">CLV Win Rate</div>
              <div className="stat-value text-accent">
                {insights.trust.clvWinRatePct}%
              </div>
            </div>
          </div>
          <PerformanceChart data={performanceData} />
        </Card>
      </section>
      </>
      )}
    </main>
  );
}
