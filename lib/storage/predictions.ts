// ---------------------------------------------------------------------------
// Prediction tracker persistence (localStorage)
// ---------------------------------------------------------------------------

const PREDICTIONS_KEY = "arebet:predictions:v1";

function safeRead(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeWrite(key: string, value: string) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, value); } catch { /* storage full */ }
}

export type PredictionOutcome = "pending" | "won" | "lost" | "void";

export type PredictionRecord = {
  id: string;
  matchId: number;
  matchLabel: string;
  market: string;
  odds: number;
  stake?: number;
  outcome: PredictionOutcome;
  addedAt: string;
  settledAt?: string;
};

export function readPredictions(): PredictionRecord[] {
  const raw = safeRead(PREDICTIONS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as PredictionRecord[]; } catch { return []; }
}

export function writePredictions(records: PredictionRecord[]): void {
  safeWrite(PREDICTIONS_KEY, JSON.stringify(records));
}
