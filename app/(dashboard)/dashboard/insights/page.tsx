"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { TextInput } from "@/components/ui/text-input";
import { listMatches } from "@/lib/services/matches";
import { buildInsightBundle, scenarioSuggestion } from "@/lib/insights/engine";
import { DEMO_BANKROLL, DEMO_BETS } from "@/lib/demo/bets";
import type { Match } from "@/types/match";

export default function InsightsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [minute, setMinute] = useState("70");
  const [goalDiff, setGoalDiff] = useState("0");

  useEffect(() => {
    async function load() {
      const feed = await listMatches();
      setMatches(feed.matches);
      if (feed.matches.length) {
        setSelectedMatchId(String(feed.matches[0].id));
      }
    }
    load();
  }, []);

  const insights = useMemo(() => buildInsightBundle(matches, DEMO_BETS, DEMO_BANKROLL), [matches]);
  const selectedMatch = useMemo(
    () => matches.find((item) => item.id === Number(selectedMatchId)),
    [matches, selectedMatchId]
  );
  const scenarioText = selectedMatch
    ? scenarioSuggestion(selectedMatch, Number(minute) || 0, Number(goalDiff) || 0)
    : "Select a match to simulate.";

  return (
    <main className="page-wrap">
      <section className="dashboard-head">
        <h1>Insights Lab</h1>
        <p>Operational insights that betting platforms usually miss in one place.</p>
      </section>

      <section className="cards-grid">
        <Card title="1) Value Detection">
          <ul>
            {insights.valueEdges.slice(0, 5).map((edge) => (
              <li key={`${edge.matchId}-${edge.market}`}>
                Match {edge.matchId} {edge.market}: edge {edge.edgePct}% (model {edge.modelProbability}% vs implied {edge.impliedProbability}%)
              </li>
            ))}
          </ul>
        </Card>

        <Card title="2) Market Movement">
          <ul>
            {insights.marketMoves.slice(0, 5).map((move) => (
              <li key={`${move.matchId}-${move.market}`}>
                Match {move.matchId} {move.market}: {move.openOdds} to {move.currentOdds} ({move.driftPct}%)
              </li>
            ))}
          </ul>
        </Card>

        <Card title="3) CLV Feedback">
          <p className="muted">Avg CLV edge: {insights.clv.avgCLVEdgePct}%</p>
          <p className="muted">Positive CLV rate: {insights.clv.positiveCLVPct}%</p>
        </Card>
      </section>

      <section className="cards-grid">
        <Card title="4) Portfolio Risk">
          <p className="muted">Stake in market: {insights.portfolio.totalStake}</p>
          <p className="muted">Bankroll exposure: {insights.portfolio.stakePctOfBankroll}%</p>
          <p className="muted">Correlation risk: {insights.portfolio.correlationRisk}</p>
        </Card>

        <Card title="5) Personalized Edge Modeling">
          <p className="muted">Best leagues:</p>
          <ul>
            {insights.personalization.strongestLeagues.map((item) => (
              <li key={item.key}>
                {item.key}: ROI {item.roiPct}% ({item.bets} bets)
              </li>
            ))}
          </ul>
          <p className="muted">Best markets:</p>
          <ul>
            {insights.personalization.strongestMarkets.map((item) => (
              <li key={item.key}>
                {item.key}: ROI {item.roiPct}% ({item.bets} bets)
              </li>
            ))}
          </ul>
        </Card>

        <Card title="6) Arbitrage Scanner">
          {insights.arbitrage.length ? (
            <ul>
              {insights.arbitrage.map((arb) => (
                <li key={arb.matchId}>
                  Match {arb.matchId}: overround {arb.overroundPct}% (H {arb.bestHome}, D {arb.bestDraw}, A {arb.bestAway})
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No current arbitrage in demo feed.</p>
          )}
        </Card>
      </section>

      <section className="cards-grid">
        <Card title="7) Scenario Simulator">
          <SelectField
            label="Match"
            value={selectedMatchId}
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

        <Card title="8) Explainable Predictions">
          <ul>
            {insights.explainability.slice(0, 3).map((item) => (
              <li key={item.matchId}>
                Match {item.matchId}: {item.reasons.join(" ")}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="9) Post-match Analytics">
          <p className="muted">By league:</p>
          <ul>
            {insights.postMatch.byLeague.map((item) => (
              <li key={item.key}>
                {item.key}: ROI {item.roiPct}% (W {item.wins} / L {item.losses})
              </li>
            ))}
          </ul>
          <p className="muted">By market:</p>
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
        <Card title="10) Trust and Verification">
          <p className="muted">Sample size: {insights.trust.sampleSize} bets</p>
          <p className="muted">Hit rate: {insights.trust.hitRatePct}%</p>
          <p className="muted">ROI: {insights.trust.roiPct}%</p>
          <p className="muted">Positive CLV rate: {insights.trust.clvWinRatePct}%</p>
        </Card>
      </section>
    </main>
  );
}
