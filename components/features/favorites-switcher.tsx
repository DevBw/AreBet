"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useFavorites } from "@/lib/hooks/use-favorites";

export function FavoritesSwitcher() {
  const { favorites } = useFavorites();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const teams = favorites.filter((f) => f.entity_type === "team");
  const leagues = favorites.filter((f) => f.entity_type === "league");

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!favorites.length) return null;

  return (
    <div className="fav-switcher" ref={ref}>
      <button
        type="button"
        className="fav-switcher-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        Favorites ({favorites.length})
      </button>

      {open && (
        <div className="fav-switcher-menu">
          <Link href="/dashboard/favorites" onClick={() => setOpen(false)}>
            All favorites
          </Link>

          {teams.length > 0 && (
            <>
              <div className="fav-switcher-divider" />
              {teams.map((t) => (
                <Link
                  key={t.entity_id}
                  href={`/dashboard?q=${encodeURIComponent(t.label)}`}
                  onClick={() => setOpen(false)}
                >
                  {t.label}
                </Link>
              ))}
            </>
          )}

          {leagues.length > 0 && (
            <>
              <div className="fav-switcher-divider" />
              {leagues.map((l) => (
                <Link
                  key={l.entity_id}
                  href="/widgets"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
