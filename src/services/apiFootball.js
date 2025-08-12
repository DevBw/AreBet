const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;

// Cache for API responses (in-memory cache)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 30;
const RATE_LIMIT_RESET_INTERVAL = 60 * 1000; // 1 minute

// Reset rate limit counter
setInterval(() => {
  requestCount = 0;
}, RATE_LIMIT_RESET_INTERVAL);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCacheKey(path, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${path}?${sortedParams}`;
}

function getCachedResponse(cacheKey) {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(cacheKey);
  return null;
}

function setCachedResponse(cacheKey, data) {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  // Clean up old cache entries
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

async function fetchJson(path, { params = {}, method = 'GET', retries = 2, useCache = true } = {}) {
  // Check rate limit
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error('Rate limit exceeded. Please try again in a moment.');
  }
  
  const cacheKey = useCache ? getCacheKey(path, params) : null;
  
  // Check cache first
  if (useCache && cacheKey) {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      requestCount++;
      
      const res = await fetch(url.toString(), {
        method,
        headers: {
          'x-apisports-key': API_KEY ?? '',
        },
      });
      
      if (res.status === 429 && attempt < retries) {
        // Rate limit: exponential backoff
        const delay = Math.min(1000 * (2 ** attempt), 10000);
        await sleep(delay);
        continue;
      }
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`ApiFootball error ${res.status}: ${text}`);
      }
      
      const json = await res.json();
      
      // Cache successful responses
      if (useCache && cacheKey) {
        setCachedResponse(cacheKey, json);
      }
      
      return json;
    } catch (error) {
      if (attempt === retries - 1) {
        throw error;
      }
      // Wait before retry
      await sleep(1000 * (attempt + 1));
    }
  }
}

export const apiFootball = {
  // Existing endpoints
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

  // NEW: Enhanced Player Features
  getPlayerById: ({ id, season }) => fetchJson('/players', { params: { id, season } }),
  getPlayerStats: ({ id, season, league }) => fetchJson('/players', { params: { id, season, league } }),
  getPlayerSeasons: ({ player }) => fetchJson('/players/seasons', { params: { player } }),
  searchPlayers: ({ search, league, team, season, page = 1 }) => 
    fetchJson('/players', { params: { search, league, team, season, page } }),
  getTopYellowCards: ({ league, season }) => fetchJson('/players/topyellowcards', { params: { league, season } }),
  getTopRedCards: ({ league, season }) => fetchJson('/players/topredcards', { params: { league, season } }),

  // NEW: Injury & Transfer Data
  getInjuries: ({ league, season, team, player, date, timezone = 'UTC' }) =>
    fetchJson('/injuries', { params: { league, season, team, player, date, timezone } }),
  getTransfers: ({ team, player }) => fetchJson('/transfers', { params: { team, player } }),

  // NEW: Enhanced Match Data
  getMatchCommentary: ({ fixture }) => fetchJson('/fixtures/players', { params: { fixture } }),
  getMatchPlayerStats: ({ fixture }) => fetchJson('/fixtures/players', { params: { fixture } }),
  getReferee: ({ id, search, page = 1 }) => fetchJson('/referee', { params: { id, search, page } }),

  // NEW: Historical & Archive Data
  getSeasons: () => fetchJson('/leagues/seasons'),
  getCountries: ({ name, code, search }) => fetchJson('/countries', { params: { name, code, search } }),
  getVenues: ({ id, name, search, country, city }) => 
    fetchJson('/venues', { params: { id, name, search, country, city } }),

  // NEW: Advanced Statistics
  getFixtureStatistics: ({ fixture }) => fetchJson('/fixtures/statistics', { params: { fixture } }),
  getLeagueStatistics: ({ league, season, team, date }) => 
    fetchJson('/teams/statistics', { params: { league, season, team, date } }),

  // NEW: Live & Real-time Features
  getLiveEvents: ({ fixture }) => fetchJson('/fixtures/events', { params: { fixture, live: true } }),
  getLiveStatistics: ({ fixture }) => fetchJson('/fixtures/statistics', { params: { fixture, live: true } }),

  // NEW: Coach Information
  getCoaches: ({ id, team, search }) => fetchJson('/coachs', { params: { id, team, search } }),

  // NEW: Odds (if subscription supports it)
  getOdds: ({ fixture, league, season, date, page = 1 }) => 
    fetchJson('/odds', { params: { fixture, league, season, date, page } }),
  getBookmakers: ({ id, search }) => fetchJson('/odds/bookmakers', { params: { id, search } }),

  // NEW: Timezone support
  getTimezones: () => fetchJson('/timezone'),
};

export default apiFootball;


