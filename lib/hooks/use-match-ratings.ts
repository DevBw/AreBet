"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readMatchRatings,
  setMatchRating,
  clearMatchRating,
  type MatchRatingsMap,
} from "@/lib/storage/match-ratings";

export function useMatchRatings() {
  const [ratings, setRatings] = useState<MatchRatingsMap>({});

  // Hydrate from localStorage on mount
  useEffect(() => {
    setRatings(readMatchRatings());
  }, []);

  const rate = useCallback((matchId: number, stars: number) => {
    setMatchRating(matchId, stars);
    setRatings(readMatchRatings());
  }, []);

  const unrate = useCallback((matchId: number) => {
    clearMatchRating(matchId);
    setRatings(readMatchRatings());
  }, []);

  const getRating = useCallback(
    (matchId: number): number => ratings[String(matchId)] ?? 0,
    [ratings]
  );

  return { ratings, rate, unrate, getRating };
}
