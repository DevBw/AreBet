import { getDemoMatchFeed } from "@/lib/demo/matches";
import type { Match, MatchFeed } from "@/types/match";

function shouldUseDemoMode() {
  const forceDemo = process.env.NEXT_PUBLIC_USE_DEMO_DATA;
  const hasApiKey = Boolean(process.env.API_FOOTBALL_KEY);
  if (forceDemo === "true") return true;
  if (forceDemo === "false") return false;
  return !hasApiKey;
}

function addLatency(ms = 550) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listMatches(): Promise<MatchFeed> {
  await addLatency();

  if (shouldUseDemoMode()) {
    return getDemoMatchFeed();
  }

  // API integration intentionally deferred. Keep app functional with demo fallback.
  return getDemoMatchFeed();
}

export async function getMatchById(id: number): Promise<{ source: MatchFeed["source"]; updatedAtISO: string; match: Match | null }> {
  const feed = await listMatches();
  return {
    source: feed.source,
    updatedAtISO: feed.updatedAtISO,
    match: feed.matches.find((item) => item.id === id) ?? null,
  };
}
