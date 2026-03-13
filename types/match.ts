export type MatchStatus = "LIVE" | "UPCOMING" | "FINISHED";

export type TeamForm = {
  recent: string;
  goalsFor: number;
  goalsAgainst: number;
};

export type TeamSide = {
  name: string;
  short: string;
  form: TeamForm;
};

export type Score = {
  home: number;
  away: number;
};

export type MatchOdds = {
  home: number;
  draw: number;
  away: number;
  over25: number;
  btts: number;
};

export type MarketPoint = {
  label: string;
  home: number;
  draw: number;
  away: number;
};

export type BookmakerOdds = {
  bookmaker: string;
  home: number;
  draw: number;
  away: number;
};

export type MatchPrediction = {
  confidence: number;
  advice: string;
  expectedGoals: number;
};

export type MatchEvent = {
  minute: number;
  team: string;
  type: "Goal" | "Card" | "Substitution";
  player: string;
  detail: string;
};

export type MatchStats = {
  possession: { home: number; away: number }; // must sum to 100
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  xg: { home: number; away: number };
  passAccuracy: { home: number; away: number }; // 0-100
  corners: { home: number; away: number };
};

export type Match = {
  id: number;
  league: string;
  country: string;
  venue: string;
  kickoffISO: string;
  status: MatchStatus;
  minute?: number;
  home: TeamSide;
  away: TeamSide;
  score: Score;
  odds: MatchOdds;
  marketHistory: MarketPoint[];
  bookmakerOdds: BookmakerOdds[];
  prediction: MatchPrediction;
  events: MatchEvent[];
  stats?: MatchStats;
};

export type DataSource = "demo" | "api";

export type MatchFeed = {
  source: DataSource;
  updatedAtISO: string;
  matches: Match[];
};
