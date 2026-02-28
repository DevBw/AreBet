"use client";

import { useState } from "react";

const FAVORITES_KEY = "arebet.favorites";

function loadFavorites() {
  if (typeof window === "undefined") return new Set<number>();
  const saved = localStorage.getItem(FAVORITES_KEY);
  if (!saved) return new Set<number>();
  return new Set(JSON.parse(saved) as number[]);
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(loadFavorites);

  function toggleFavorite(matchId: number) {
    const next = new Set(favorites);
    if (next.has(matchId)) next.delete(matchId);
    else next.add(matchId);
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(next)));
  }

  return { favorites, toggleFavorite };
}

