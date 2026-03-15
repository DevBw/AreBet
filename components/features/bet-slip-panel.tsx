"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { readSlip, writeSlip, type SlipPick } from "@/lib/storage/bet-slip";
import { usePredictions } from "@/lib/hooks/use-predictions";
import { useToast } from "@/components/ui/toast";

// ============================================================
// Context
// ============================================================

type BetSlipContextValue = {
  picks: SlipPick[];
  addPick: (pick: Omit<SlipPick, "id" | "addedAt">) => void;
  removePick: (id: string) => void;
  removePickByMarket: (matchId: number, market: string) => void;
  updateStake: (id: string, stake: number | undefined) => void;
  clearSlip: () => void;
  hasPick: (matchId: number, market: string) => boolean;
};

const BetSlipContext = createContext<BetSlipContextValue | null>(null);

export function useBetSlipContext(): BetSlipContextValue {
  const ctx = useContext(BetSlipContext);
  if (!ctx) throw new Error("useBetSlipContext must be used within <BetSlipProvider>");
  return ctx;
}

// ============================================================
// Provider
// ============================================================

export function BetSlipProvider({ children }: { children: React.ReactNode }) {
  const [picks, setPicks] = useState<SlipPick[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    setPicks(readSlip());
  }, []);

  const addPick = useCallback((pick: Omit<SlipPick, "id" | "addedAt">) => {
    const current = readSlip();
    const exists = current.some(
      (p) => p.matchId === pick.matchId && p.market === pick.market
    );
    if (exists) return;
    const next: SlipPick = {
      ...pick,
      id: `${pick.matchId}-${++counterRef.current}-${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    const updated = [...current, next];
    writeSlip(updated);
    setPicks(updated);
  }, []);

  const removePick = useCallback((id: string) => {
    const updated = readSlip().filter((p) => p.id !== id);
    writeSlip(updated);
    setPicks(updated);
  }, []);

  const removePickByMarket = useCallback((matchId: number, market: string) => {
    const updated = readSlip().filter(
      (p) => !(p.matchId === matchId && p.market === market)
    );
    writeSlip(updated);
    setPicks(updated);
  }, []);

  const updateStake = useCallback((id: string, stake: number | undefined) => {
    const updated = readSlip().map((p) =>
      p.id === id ? { ...p, stake } : p
    );
    writeSlip(updated);
    setPicks(updated);
  }, []);

  const clearSlip = useCallback(() => {
    writeSlip([]);
    setPicks([]);
  }, []);

  const hasPick = useCallback(
    (matchId: number, market: string) =>
      picks.some((p) => p.matchId === matchId && p.market === market),
    [picks]
  );

  return (
    <BetSlipContext.Provider
      value={{ picks, addPick, removePick, removePickByMarket, updateStake, clearSlip, hasPick }}
    >
      {children}
    </BetSlipContext.Provider>
  );
}

// ============================================================
// Slip Pick Row (inside panel)
// ============================================================

function SlipPickRow({
  pick,
  onRemove,
  onStakeChange,
}: {
  pick: SlipPick;
  onRemove: (id: string) => void;
  onStakeChange: (id: string, stake: number | undefined) => void;
}) {
  const potReturn =
    pick.stake != null && pick.stake > 0
      ? (pick.stake * pick.odds).toFixed(2)
      : null;

  return (
    <div className="slip-row">
      <div className="slip-row-top">
        <div className="slip-row-info">
          <span className="slip-row-market">{pick.market}</span>
          <span className="slip-row-match">{pick.matchLabel}</span>
        </div>
        <span className="slip-row-odds">{pick.odds.toFixed(2)}</span>
        <button
          type="button"
          className="slip-row-remove"
          onClick={() => onRemove(pick.id)}
          aria-label={`Remove ${pick.market} from slip`}
        >
          &times;
        </button>
      </div>
      <div className="slip-row-stake">
        <label className="slip-stake-label" htmlFor={`stake-${pick.id}`}>
          Stake
        </label>
        <input
          id={`stake-${pick.id}`}
          type="number"
          min="0"
          step="0.50"
          className="slip-stake-input"
          placeholder="0.00"
          value={pick.stake ?? ""}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            onStakeChange(pick.id, isNaN(val) ? undefined : val);
          }}
        />
        {potReturn && (
          <span className="slip-potential-return">
            &rarr; <strong>{potReturn}</strong>
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Panel UI  (FAB + slide-in panel)
// ============================================================

export function BetSlipPanel() {
  const { picks, removePick, updateStake, clearSlip } = useBetSlipContext();
  const { addFromPicks } = usePredictions();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const combinedOdds = picks.reduce((acc, p) => acc * p.odds, 1);
  const count = picks.length;

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        className={`slip-fab${count > 0 ? " has-picks" : ""}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={`Bet slip — ${count} pick${count !== 1 ? "s" : ""}`}
        title="Bet Slip"
      >
        {/* Clipboard icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="13" y2="16" />
        </svg>
        {count > 0 && (
          <span className="slip-fab-badge" aria-hidden="true">
            {count}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="slip-panel" role="region" aria-label="Bet slip">
          <div className="slip-panel-header">
            <span className="slip-panel-title">Bet Slip</span>
            {count > 1 && (
              <span className="slip-combined-odds" title="Combined odds">
                {combinedOdds.toFixed(2)}&times;
              </span>
            )}
            <button
              type="button"
              className="slip-panel-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close slip"
            >
              &times;
            </button>
          </div>

          <div className="slip-panel-body">
            {count === 0 ? (
              <p className="slip-empty">
                No picks yet. Tap any odds in a match to add a selection.
              </p>
            ) : (
              <>
                <div className="slip-picks-list">
                  {picks.map((pick) => (
                    <SlipPickRow
                      key={pick.id}
                      pick={pick}
                      onRemove={removePick}
                      onStakeChange={updateStake}
                    />
                  ))}
                </div>
                <div className="slip-actions">
                  <button
                    type="button"
                    className="slip-track-btn"
                    onClick={() => {
                      const added = addFromPicks(picks);
                      addToast(
                        added > 0
                          ? `${added} pick${added !== 1 ? "s" : ""} added to tracker`
                          : "Picks already tracked — visit Predictions",
                        "info",
                      );
                    }}
                  >
                    Track Picks
                  </button>
                  <button
                    type="button"
                    className="slip-clear-btn"
                    onClick={clearSlip}
                  >
                    Clear all
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
