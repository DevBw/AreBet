"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listMatches } from "@/lib/services/matches";
import type { MatchFeed } from "@/types/match";

type UseMatchFeedOptions = {
  pollIntervalMs?: number;
};

export function useMatchFeed(options: UseMatchFeedOptions = {}) {
  const { pollIntervalMs } = options;
  const [feed, setFeed] = useState<MatchFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMatches();
      setFeed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load matches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function safeLoad() {
      if (!mounted) return;
      await load();
    }

    safeLoad();

    if (!pollIntervalMs) {
      return () => {
        mounted = false;
      };
    }

    const timer = setInterval(safeLoad, pollIntervalMs);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [load, pollIntervalMs]);

  const matches = useMemo(() => feed?.matches ?? [], [feed]);

  return { feed, matches, loading, error, reload: load };
}

