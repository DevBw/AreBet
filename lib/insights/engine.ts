import type { Match } from "@/types/match";
import type { BetRecord } from "@/lib/demo/bets";

type MarketEdge = {
  matchId: number;
  market: "HOME" | "DRAW" | "AWAY";
  modelProbability: number;
  impliedProbability: number;
  edgePct: number;
};

type MarketMove = {
  matchId: number;
  market: "HOME" | "DRAW" | "AWAY";
  openOdds: number;
  currentOdds: number;
  driftPct: number;
};

type ArbitrageOpportunity = {
  matchId: number;
  overroundPct: number;
  bestHome: number;
  bestDraw: number;
  bestAway: number;
};

type PortfolioExposure = {
  totalStake: number;
  stakePctOfBankroll: number;
  byLeague: Record<string, number>;
  correlationRisk: "LOW" | "MEDIUM" | "HIGH";
};

type PerformanceByKey = {
  key: string;
  bets: number;
  wins: number;
  losses: number;
  roiPct: number;
};

type TrustMetrics = {
  sampleSize: number;
  hitRatePct: number;
  roiPct: number;
  clvWinRatePct: number;
};

export type InsightBundle = {
  valueEdges: MarketEdge[];
  marketMoves: MarketMove[];
  clv: {
    avgCLVEdgePct: number;
    positiveCLVPct: number;
  };
  portfolio: PortfolioExposure;
  personalization: {
    strongestLeagues: PerformanceByKey[];
    strongestMarkets: PerformanceByKey[];
  };
  arbitrage: ArbitrageOpportunity[];
  explainability: {
    matchId: number;
    reasons: string[];
  }[];
  postMatch: {
    byLeague: PerformanceByKey[];
    byMarket: PerformanceByKey[];
  };
  trust: TrustMetrics;
};

function impliedProb(odds: number) {
  return 1 / odds;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function modelProbabilities(match: Match) {
  const base = match.prediction.confidence / 100;
  const home = Math.min(0.82, Math.max(0.15, base));
  const draw = Math.max(0.12, (1 - home) * 0.35);
  const away = Math.max(0.1, 1 - home - draw);
  return { home, draw, away };
}

function marketEdges(matches: Match[]) {
  return matches.flatMap((match) => {
    const model = modelProbabilities(match);
    const lines: Array<{ market: "HOME" | "DRAW" | "AWAY"; model: number; odds: number }> = [
      { market: "HOME", model: model.home, odds: match.odds.home },
      { market: "DRAW", model: model.draw, odds: match.odds.draw },
      { market: "AWAY", model: model.away, odds: match.odds.away },
    ];
    return lines
      .map((line) => {
        const implied = impliedProb(line.odds);
        return {
          matchId: match.id,
          market: line.market,
          modelProbability: round2(line.model * 100),
          impliedProbability: round2(implied * 100),
          edgePct: round2((line.model - implied) * 100),
        };
      })
      .filter((item) => item.edgePct > 1.25);
  });
}

function marketMovement(matches: Match[]) {
  return matches.flatMap((match) => {
    const open = match.marketHistory[0];
    const current = match.marketHistory[match.marketHistory.length - 1];
    if (!open || !current) return [];
    const records: Array<{ market: "HOME" | "DRAW" | "AWAY"; open: number; current: number }> = [
      { market: "HOME", open: open.home, current: current.home },
      { market: "DRAW", open: open.draw, current: current.draw },
      { market: "AWAY", open: open.away, current: current.away },
    ];
    return records.map((record) => ({
      matchId: match.id,
      market: record.market,
      openOdds: record.open,
      currentOdds: record.current,
      driftPct: round2(((record.current - record.open) / record.open) * 100),
    }));
  });
}

function clvStats(bets: BetRecord[]) {
  if (!bets.length) return { avgCLVEdgePct: 0, positiveCLVPct: 0 };
  const edges = bets.map((bet) => ((bet.oddsTaken - bet.closingOdds) / bet.closingOdds) * 100);
  const avg = edges.reduce((sum, item) => sum + item, 0) / edges.length;
  const positive = edges.filter((item) => item > 0).length / edges.length;
  return {
    avgCLVEdgePct: round2(avg),
    positiveCLVPct: round2(positive * 100),
  };
}

function portfolioRisk(bets: BetRecord[], bankroll: number) {
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const byLeague = bets.reduce<Record<string, number>>((acc, bet) => {
    acc[bet.league] = (acc[bet.league] ?? 0) + bet.stake;
    return acc;
  }, {});
  const maxLeagueExposure = Math.max(0, ...Object.values(byLeague));
  const correlationRisk: PortfolioExposure["correlationRisk"] =
    maxLeagueExposure / Math.max(totalStake, 1) > 0.5
      ? "HIGH"
      : maxLeagueExposure / Math.max(totalStake, 1) > 0.35
      ? "MEDIUM"
      : "LOW";
  return {
    totalStake: round2(totalStake),
    stakePctOfBankroll: round2((totalStake / bankroll) * 100),
    byLeague,
    correlationRisk,
  };
}

function roiForBets(bets: BetRecord[]) {
  if (!bets.length) return 0;
  const returns = bets.reduce((sum, bet) => {
    if (bet.result === "WIN") return sum + bet.stake * (bet.oddsTaken - 1);
    if (bet.result === "LOSS") return sum - bet.stake;
    return sum;
  }, 0);
  const staked = bets.reduce((sum, bet) => sum + bet.stake, 0);
  return staked ? round2((returns / staked) * 100) : 0;
}

function performanceGroups(bets: BetRecord[], keyGetter: (bet: BetRecord) => string): PerformanceByKey[] {
  const groups = new Map<string, BetRecord[]>();
  bets.forEach((bet) => {
    const key = keyGetter(bet);
    const group = groups.get(key) ?? [];
    group.push(bet);
    groups.set(key, group);
  });

  return Array.from(groups.entries()).map(([key, group]) => ({
    key,
    bets: group.length,
    wins: group.filter((item) => item.result === "WIN").length,
    losses: group.filter((item) => item.result === "LOSS").length,
    roiPct: roiForBets(group),
  }));
}

function arbitrage(matches: Match[]): ArbitrageOpportunity[] {
  return matches
    .map((match) => {
      const bestHome = Math.max(...match.bookmakerOdds.map((item) => item.home));
      const bestDraw = Math.max(...match.bookmakerOdds.map((item) => item.draw));
      const bestAway = Math.max(...match.bookmakerOdds.map((item) => item.away));
      const overround = (1 / bestHome + 1 / bestDraw + 1 / bestAway) * 100;
      return {
        matchId: match.id,
        overroundPct: round2(overround),
        bestHome,
        bestDraw,
        bestAway,
      };
    })
    .filter((item) => item.overroundPct < 100.2);
}

function explain(match: Match) {
  const reasons: string[] = [];
  if (match.home.form.recent.startsWith("WW")) reasons.push(`${match.home.name} strong recent form.`);
  if (match.home.form.goalsFor - match.home.form.goalsAgainst >= 6) reasons.push(`${match.home.name} positive goal differential.`);
  if (match.prediction.confidence >= 70) reasons.push(`Model confidence above 70%.`);
  if (match.marketHistory.length >= 2) {
    const open = match.marketHistory[0].home;
    const now = match.marketHistory[match.marketHistory.length - 1].home;
    if (now < open) reasons.push(`Home odds shortened from ${open} to ${now}.`);
  }
  if (!reasons.length) reasons.push("Balanced fixture with moderate edge.");
  return { matchId: match.id, reasons };
}

function trustMetrics(bets: BetRecord[]) {
  const wins = bets.filter((item) => item.result === "WIN").length;
  const losses = bets.filter((item) => item.result === "LOSS").length;
  const settled = wins + losses;
  const clvPositive = bets.filter((item) => item.oddsTaken > item.closingOdds).length;
  return {
    sampleSize: bets.length,
    hitRatePct: settled ? round2((wins / settled) * 100) : 0,
    roiPct: roiForBets(bets),
    clvWinRatePct: bets.length ? round2((clvPositive / bets.length) * 100) : 0,
  };
}

export function scenarioSuggestion(match: Match, minute: number, goalDiff: number) {
  if (minute < 30 && goalDiff === 0) return "Hold position. Wait for better in-play price.";
  if (minute >= 60 && goalDiff === 0) return "Consider BTTS/next-goal micro market, stake reduced.";
  if (goalDiff > 0 && minute > 70) return "Protect profit with partial hedge on draw.";
  if (goalDiff < 0 && minute > 65) return "Avoid chasing. Prefer small stake comeback only.";
  return "Maintain base position; no major adjustment.";
}

export function buildInsightBundle(matches: Match[], bets: BetRecord[], bankroll: number): InsightBundle {
  const byLeague = performanceGroups(bets, (bet) => bet.league).sort((a, b) => b.roiPct - a.roiPct);
  const byMarket = performanceGroups(bets, (bet) => bet.market).sort((a, b) => b.roiPct - a.roiPct);
  return {
    valueEdges: marketEdges(matches).sort((a, b) => b.edgePct - a.edgePct),
    marketMoves: marketMovement(matches).sort((a, b) => Math.abs(b.driftPct) - Math.abs(a.driftPct)),
    clv: clvStats(bets),
    portfolio: portfolioRisk(bets, bankroll),
    personalization: {
      strongestLeagues: byLeague.slice(0, 3),
      strongestMarkets: byMarket.slice(0, 3),
    },
    arbitrage: arbitrage(matches),
    explainability: matches.map(explain),
    postMatch: {
      byLeague,
      byMarket,
    },
    trust: trustMetrics(bets),
  };
}
