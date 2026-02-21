const API_BASE = "https://v3.football.api-sports.io";

export async function apiFootball(path: string, params: Record<string, string> = {}) {
  const key = process.env.API_FOOTBALL_KEY;
  const url = new URL(API_BASE + path);

  Object.entries(params).forEach(([k, v]) => {
    if (v) url.searchParams.set(k, v);
  });

  const response = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": key ?? "",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API-Football request failed with ${response.status}`);
  }

  return response.json();
}
