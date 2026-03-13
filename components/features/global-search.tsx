"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getDemoMatchFeed } from "@/lib/demo/matches";

// ---- Types ----

type ResultKind = "match" | "team" | "league";

type SearchResult = {
  kind: ResultKind;
  id: string;
  label: string;
  meta?: string;
  href: string;
};

// ---- Search logic ----

function buildResults(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const { matches } = getDemoMatchFeed();
  const results: SearchResult[] = [];

  // Matches
  for (const m of matches) {
    const hay = `${m.home.name} ${m.away.name} ${m.league}`.toLowerCase();
    if (hay.includes(q)) {
      const statusLabel =
        m.status === "LIVE"
          ? "Live"
          : m.status === "UPCOMING"
          ? "Upcoming"
          : "Finished";
      results.push({
        kind: "match",
        id: `match-${m.id}`,
        label: `${m.home.name} vs ${m.away.name}`,
        meta: `${m.league} \u00B7 ${statusLabel}`,
        href: `/?matchId=${m.id}`,
      });
    }
  }

  // Teams (unique)
  const seenTeams = new Set<string>();
  for (const m of matches) {
    for (const name of [m.home.name, m.away.name]) {
      if (!seenTeams.has(name) && name.toLowerCase().includes(q)) {
        seenTeams.add(name);
        results.push({
          kind: "team",
          id: `team-${name}`,
          label: name,
          href: `/?q=${encodeURIComponent(name)}`,
        });
      }
    }
  }

  // Leagues (unique)
  const seenLeagues = new Set<string>();
  for (const m of matches) {
    if (!seenLeagues.has(m.league) && m.league.toLowerCase().includes(q)) {
      seenLeagues.add(m.league);
      results.push({
        kind: "league",
        id: `league-${m.league}`,
        label: m.league,
        meta: m.country,
        href: `/?q=${encodeURIComponent(m.league)}`,
      });
    }
  }

  return results.slice(0, 10);
}

// ---- Grouped display ----

const GROUPS: { kind: ResultKind; label: string; icon: string }[] = [
  { kind: "match",  label: "Matches",  icon: "\u26BD" },
  { kind: "team",   label: "Teams",    icon: "\u{1F465}" },
  { kind: "league", label: "Leagues",  icon: "\uD83C\uDFC6" },
];

const KIND_TAG: Record<ResultKind, string> = {
  match:  "Match",
  team:   "Team",
  league: "League",
};

// ---- Component ----

export function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen]   = useState(false);
  const [query,  setQuery]    = useState("");
  const [cursor, setCursor]   = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => buildResults(query), [query]);

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setCursor(-1);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setCursor(-1);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  // Global keyboard shortcut: "/" opens search
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === "/" && !isOpen) {
        const tag = (document.activeElement?.tagName ?? "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        e.preventDefault();
        open();
      }
      if (e.key === "Escape" && isOpen) close();
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, open, close]);

  // Auto-focus input when overlay opens
  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen]);

  // Arrow-key + Enter navigation inside results
  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = cursor >= 0 ? results[cursor] : results[0];
      if (target) go(target.href);
    }
  }

  // ---- Trigger button (always visible in header) ----
  if (!isOpen) {
    return (
      <button
        type="button"
        className="gs-trigger"
        onClick={open}
        title="Search  (press / to open)"
        aria-label="Open global search"
        aria-keyshortcuts="/"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="gs-trigger-label">Search</span>
        <kbd className="gs-trigger-kbd">/</kbd>
      </button>
    );
  }

  // ---- Overlay ----
  const groups = GROUPS.map((g) => ({
    ...g,
    items: results.filter((r) => r.kind === g.kind),
  })).filter((g) => g.items.length > 0);

  return (
    <div
      className="gs-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <div className="gs-backdrop" onClick={close} aria-hidden="true" />

      <div className="gs-modal">
        {/* Input row */}
        <div className="gs-input-row">
          <svg
            className="gs-input-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className="gs-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(-1);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search matches, teams, leagues\u2026"
            autoComplete="off"
            spellCheck={false}
            aria-autocomplete="list"
            aria-controls="gs-results-list"
          />
          <button
            type="button"
            className="gs-esc-btn"
            onClick={close}
            aria-label="Close search"
          >
            Esc
          </button>
        </div>

        {/* Results */}
        {query ? (
          <div id="gs-results-list" className="gs-results" role="listbox">
            {groups.length === 0 && (
              <p className="gs-empty">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}
            {groups.map(({ kind, label, icon, items }) => (
              <div key={kind} className="gs-group">
                <span className="gs-group-label">{label}</span>
                {items.map((r) => {
                  const flatIdx = results.findIndex((x) => x.id === r.id);
                  const isActive = flatIdx === cursor;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={`gs-result${isActive ? " is-active" : ""}`}
                      onClick={() => go(r.href)}
                      onMouseEnter={() => setCursor(flatIdx)}
                    >
                      <span className="gs-result-icon" aria-hidden="true">
                        {icon}
                      </span>
                      <span className="gs-result-body">
                        <span className="gs-result-label">{r.label}</span>
                        {r.meta && (
                          <span className="gs-result-meta">{r.meta}</span>
                        )}
                      </span>
                      <span className="gs-result-tag">{KIND_TAG[kind]}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          /* Empty state hint */
          <div className="gs-hint">
            <p className="gs-hint-text">
              Search across matches, teams and leagues
            </p>
            <div className="gs-shortcuts">
              <span><kbd>&uarr;&darr;</kbd> navigate</span>
              <span><kbd>Enter</kbd> select</span>
              <span><kbd>Esc</kbd> close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
