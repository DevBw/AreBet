"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isOnboarded,
  markOnboarded,
  readDefaultStake,
  writeDefaultStake,
  readFavLeagues,
  writeFavLeagues,
  ALL_LEAGUES,
  type League,
} from "@/lib/storage/onboarding";
import { useTheme } from "@/lib/hooks/use-theme";
import { usePreferences } from "@/lib/hooks/use-preferences";

// ── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ["welcome", "leagues", "stake", "appearance"] as const;
type Step = (typeof STEPS)[number];

const STAKE_PRESETS = [5, 10, 25, 50];

// ── Component ────────────────────────────────────────────────────────────────

export function OnboardingModal() {
  const [visible, setVisible]       = useState(false);
  const [step, setStep]             = useState<Step>("welcome");
  const [leaving, setLeaving]       = useState(false);
  const [leagues, setLeagues]       = useState<League[]>([]);
  const [stake, setStake]           = useState(10);
  const [stakeInput, setStakeInput] = useState("10");

  const { theme, toggleTheme }            = useTheme();
  const { preferences, updatePreferences } = usePreferences();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Show modal if user has not completed onboarding
  useEffect(() => {
    if (!isOnboarded()) {
      setLeagues(readFavLeagues());
      setStake(readDefaultStake());
      setStakeInput(String(readDefaultStake()));
      setVisible(true);
    }
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(() => { setVisible(false); setLeaving(false); }, 260);
  }, []);

  const finish = useCallback(() => {
    writeFavLeagues(leagues);
    writeDefaultStake(stake);
    markOnboarded();
    close();
  }, [leagues, stake, close]);

  const skip = useCallback(() => {
    markOnboarded();
    close();
  }, [close]);

  const stepIndex = STEPS.indexOf(step);
  const isFirst   = stepIndex === 0;
  const isLast    = stepIndex === STEPS.length - 1;

  function goNext() {
    if (isLast) { finish(); return; }
    setStep(STEPS[stepIndex + 1]);
  }

  function goBack() {
    if (!isFirst) setStep(STEPS[stepIndex - 1]);
  }

  function toggleLeague(l: League) {
    setLeagues((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );
  }

  function handleStakeInput(val: string) {
    setStakeInput(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) setStake(n);
  }

  // ── Render guard ─────────────────────────────────────────────────────────

  if (!visible) return null;

  // ── Step content ─────────────────────────────────────────────────────────

  function renderStep() {
    switch (step) {
      // -- Welcome --
      case "welcome":
        return (
          <div className="ob-step">
            <div className="ob-badge">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2 className="ob-title">Welcome to AreBet</h2>
            <p className="ob-desc">
              Smart football betting insights at your fingertips.<br />
              Let&apos;s personalise your experience in 3 quick steps.
            </p>
            <button className="ob-btn-primary" onClick={goNext}>
              Get Started
            </button>
            <button className="ob-btn-ghost" onClick={skip}>
              Skip for now
            </button>
          </div>
        );

      // -- League picks --
      case "leagues":
        return (
          <div className="ob-step">
            <p className="ob-step-label">Step 1 of 3</p>
            <h2 className="ob-title">Pick your leagues</h2>
            <p className="ob-desc">
              Select the competitions you follow most. We&apos;ll surface them first in your feed.
            </p>
            <div className="ob-league-grid">
              {ALL_LEAGUES.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`ob-league-chip${leagues.includes(l) ? " is-selected" : ""}`}
                  onClick={() => toggleLeague(l)}
                  aria-pressed={leagues.includes(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        );

      // -- Default stake --
      case "stake":
        return (
          <div className="ob-step">
            <p className="ob-step-label">Step 2 of 3</p>
            <h2 className="ob-title">Set a default stake</h2>
            <p className="ob-desc">
              Pre-fill your stake inputs in the bet slip. You can always change it per pick.
            </p>
            <div className="ob-stake-presets">
              {STAKE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`ob-stake-chip${stake === p ? " is-selected" : ""}`}
                  onClick={() => { setStake(p); setStakeInput(String(p)); }}
                >
                  £{p}
                </button>
              ))}
            </div>
            <div className="ob-stake-custom">
              <label htmlFor="ob-stake-input" className="ob-label">
                Custom amount (£)
              </label>
              <input
                id="ob-stake-input"
                type="number"
                min="0"
                step="0.50"
                className="ob-input"
                value={stakeInput}
                onChange={(e) => handleStakeInput(e.target.value)}
              />
            </div>
          </div>
        );

      // -- Appearance --
      case "appearance":
        return (
          <div className="ob-step">
            <p className="ob-step-label">Step 3 of 3</p>
            <h2 className="ob-title">Choose your look</h2>
            <p className="ob-desc">
              Pick the theme and layout density that suits you. Change any time in Settings.
            </p>

            <div className="ob-option-group">
              <p className="ob-label">Colour theme</p>
              <div className="ob-tile-row">
                <button
                  type="button"
                  className={`ob-tile ob-tile--dark${theme === "dark" ? " is-selected" : ""}`}
                  onClick={() => { if (theme !== "dark") toggleTheme(); }}
                  aria-pressed={theme === "dark"}
                >
                  <span className="ob-tile-icon">☾</span>
                  <span className="ob-tile-label">Dark</span>
                </button>
                <button
                  type="button"
                  className={`ob-tile ob-tile--light${theme === "light" ? " is-selected" : ""}`}
                  onClick={() => { if (theme !== "light") toggleTheme(); }}
                  aria-pressed={theme === "light"}
                >
                  <span className="ob-tile-icon">☀</span>
                  <span className="ob-tile-label">Light</span>
                </button>
              </div>
            </div>

            <div className="ob-option-group">
              <p className="ob-label">Layout density</p>
              <div className="ob-tile-row">
                <button
                  type="button"
                  className={`ob-tile${preferences.density === "compact" ? " is-selected" : ""}`}
                  onClick={() => updatePreferences({ density: "compact" })}
                  aria-pressed={preferences.density === "compact"}
                >
                  <span className="ob-tile-icon">⊟</span>
                  <span className="ob-tile-label">Compact</span>
                </button>
                <button
                  type="button"
                  className={`ob-tile${preferences.density === "comfortable" ? " is-selected" : ""}`}
                  onClick={() => updatePreferences({ density: "comfortable" })}
                  aria-pressed={preferences.density === "comfortable"}
                >
                  <span className="ob-tile-icon">▭</span>
                  <span className="ob-tile-label">Comfortable</span>
                </button>
              </div>
            </div>
          </div>
        );
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={overlayRef}
      className={`ob-overlay${leaving ? " is-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to AreBet"
    >
      <div className="ob-modal">
        {/* Progress dots (hidden on welcome) */}
        {step !== "welcome" && (
          <div className="ob-dots" aria-hidden="true">
            {STEPS.slice(1).map((s, i) => (
              <span
                key={s}
                className={`ob-dot${stepIndex - 1 >= i ? " is-active" : ""}`}
              />
            ))}
          </div>
        )}

        {/* Step content */}
        {renderStep()}

        {/* Navigation row (hidden on welcome — it has inline buttons) */}
        {step !== "welcome" && (
          <div className="ob-nav">
            <button className="ob-btn-ghost" onClick={goBack}>
              Back
            </button>
            <button className="ob-btn-primary" onClick={goNext}>
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
