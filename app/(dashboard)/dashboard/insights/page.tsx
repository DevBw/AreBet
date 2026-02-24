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
        <h1>Insights</h1>
        <p>Plain-language match insights you can understand in seconds.</p>
      </section>

      <section className="cards-grid">
        <Card title="1) Is this price fair?">
          <p className="muted">
            We compare our model view vs market price. Positive edge means the market may be undervaluing that outcome.
          </p>
          <ul>
            {insights.valueEdges.slice(0, 5).map((edge) => (
              <li key={`${edge.matchId}-${edge.market}`}>
                Match {edge.matchId} {edge.market}: edge {edge.edgePct}% (model {edge.modelProbability}% vs market {edge.impliedProbability}%)
              </li>
            ))}
          </ul>
        </Card>

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

        <Card title="3) Did we beat the final price?">
          <p className="muted">
            If your chosen price is better than the final market close, that is a strong long-term signal.
          </p>
          <p className="muted">Average price edge: {insights.clv.avgCLVEdgePct}%</p>
          <p className="muted">Times we beat close: {insights.clv.positiveCLVPct}%</p>
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
            <p className="muted">No current arbitrage in demo feed.</p>
          )}
        </Card>
      </section>

      <section className="cards-grid">
        <Card title="7) What should we do if the game changes?">
          <p className="muted">Enter game state and get a simple suggested action.</p>
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
          <p className="muted">Number of tracked bets: {insights.trust.sampleSize}</p>
          <p className="muted">Win rate on settled picks: {insights.trust.hitRatePct}%</p>
          <p className="muted">Return on stake: {insights.trust.roiPct}%</p>
          <p className="muted">Rate of better-than-close prices: {insights.trust.clvWinRatePct}%</p>
        </Card>
      </section>
    </main>
  );
}
