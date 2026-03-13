// ---------------------------------------------------------------------------
// Bet slip persistence (localStorage)
// ---------------------------------------------------------------------------

const SLIP_KEY = "arebet:bet-slip:v1";

function safeRead(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeWrite(key: string, value: string) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, value); } catch { /* storage full */ }
}

export type SlipPick = {
  id: string;
  matchId: number;
  matchLabel: string; // e.g. "ARS vs BHA"
  market: string;     // e.g. "Home Win", "Draw", "Over 2.5"
  odds: number;
  stake?: number;     // user-entered, optional
  addedAt: string;    // ISO timestamp
};

export function readSlip(): SlipPick[] {
  const raw = safeRead(SLIP_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as SlipPick[]; } catch { return []; }
}

export function writeSlip(picks: SlipPick[]) {
  safeWrite(SLIP_KEY, JSON.stringify(picks));
}
