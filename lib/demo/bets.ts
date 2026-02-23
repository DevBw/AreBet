export type BetRecord = {
  id: string;
  matchId: number;
  league: string;
  market: "1X2" | "BTTS" | "OVER25";
  selection: "HOME" | "DRAW" | "AWAY" | "YES" | "NO" | "OVER" | "UNDER";
  stake: number;
  oddsTaken: number;
  closingOdds: number;
  result: "WIN" | "LOSS" | "PUSH";
  createdAtISO: string;
};

export const DEMO_BETS: BetRecord[] = [
  {
    id: "b1",
    matchId: 103,
    league: "Serie A",
    market: "BTTS",
    selection: "YES",
    stake: 40,
    oddsTaken: 1.78,
    closingOdds: 1.74,
    result: "WIN",
    createdAtISO: "2026-02-20T10:12:00Z",
  },
  {
    id: "b2",
    matchId: 101,
    league: "Premier League",
    market: "1X2",
    selection: "HOME",
    stake: 65,
    oddsTaken: 1.82,
    closingOdds: 1.74,
    result: "WIN",
    createdAtISO: "2026-02-23T16:50:00Z",
  },
  {
    id: "b3",
    matchId: 102,
    league: "La Liga",
    market: "OVER25",
    selection: "UNDER",
    stake: 35,
    oddsTaken: 1.89,
    closingOdds: 1.95,
    result: "LOSS",
    createdAtISO: "2026-02-22T08:10:00Z",
  },
  {
    id: "b4",
    matchId: 105,
    league: "Ligue 1",
    market: "1X2",
    selection: "AWAY",
    stake: 30,
    oddsTaken: 2.74,
    closingOdds: 2.7,
    result: "PUSH",
    createdAtISO: "2026-02-22T13:25:00Z",
  },
];

export const DEMO_BANKROLL = 1000;
