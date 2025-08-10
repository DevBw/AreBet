const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(path, { params = {}, method = 'GET', retries = 2 } = {}) {
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const res = await fetch(url.toString(), {
      method,
      headers: {
        'x-apisports-key': API_KEY ?? '',
      },
    });
    if (res.status === 429 && attempt < retries) {
      // rate limit: exponential backoff
      await sleep(500 * (2 ** attempt));
      continue;
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ApiFootball error ${res.status}: ${text}`);
    }
    const json = await res.json();
    return json;
  }
}

export const apiFootball = {
  getLive: () => fetchJson('/fixtures', { params: { live: 'all' } }),
  getFixturesByDate: (dateISO) => fetchJson('/fixtures', { params: { date: dateISO } }),
  getFixturesRange: (fromISO, toISO) => fetchJson('/fixtures', { params: { from: fromISO, to: toISO } }),
  getFixtureById: (fixtureId) => fetchJson('/fixtures', { params: { id: fixtureId } }),
  getMatches: ({ status, league, season, team, date }) =>
    fetchJson('/fixtures', { params: { status, league, season, team, date } }),
  getLeagues: (params = {}) => fetchJson('/leagues', { params }),
  getTeamLeagues: ({ team, season }) => fetchJson('/leagues', { params: { team, season } }),
  getTeams: ({ league, season, name, id } = {}) => fetchJson('/teams', { params: { league, season, name, id } }),
  getStatistics: ({ fixture, team }) => fetchJson('/fixtures/statistics', { params: { fixture, team } }),
  getLineups: ({ fixture }) => fetchJson('/fixtures/lineups', { params: { fixture } }),
  getH2H: ({ home, away, last = 10 } = {}) => fetchJson('/fixtures/headtohead', { params: { h2h: `${home}-${away}`, last } }),
  getStandings: ({ league, season }) => fetchJson('/standings', { params: { league, season } }),
  getTeamPlayers: ({ team, season, page = 1 }) => fetchJson('/players', { params: { team, season, page } }),
  getEvents: ({ fixture }) => fetchJson('/fixtures/events', { params: { fixture } }),
  getTopScorers: ({ league, season }) => fetchJson('/players/topscorers', { params: { league, season } }),
  getTopAssists: ({ league, season }) => fetchJson('/players/topassists', { params: { league, season } }),
  getPredictions: ({ fixture }) => fetchJson('/predictions', { params: { fixture } }),
  getTrends: ({ team, league, season } = {}) => fetchJson('/teams/statistics', { params: { team, league, season } }),
};

export default apiFootball;


