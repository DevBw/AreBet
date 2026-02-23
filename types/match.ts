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
  prediction: MatchPrediction;
  events: MatchEvent[];
};

export type DataSource = "demo" | "api";

export type MatchFeed = {
  source: DataSource;
  updatedAtISO: string;
  matches: Match[];
};
