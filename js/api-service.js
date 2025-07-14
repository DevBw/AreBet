// API-Football Service for BetHelper
class APIFootballService {
    constructor() {
        this.baseURL = 'https://v3.football.api-sports.io';
        this.apiKey = '34217e3a7aa4a6e0acf7dfc67a7c726a';
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.lastRequestTime = 0;
        this.minRequestInterval = 2000; // Reduced to 2 seconds between requests
        this.maxConcurrentRequests = 3; // Allow more concurrent requests
        this.activeRequests = 0;
    }

    // Queue management for rate limiting
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
            const { resolve, reject, requestFn } = this.requestQueue.shift();
            
            // Ensure minimum interval between requests
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            if (timeSinceLastRequest < this.minRequestInterval) {
                await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
            }

            this.activeRequests++;
            this.lastRequestTime = Date.now();

            // Execute request without blocking the queue
            requestFn()
                .then(result => {
                    this.activeRequests--;
                    resolve(result);
                    this.processQueue(); // Process next request
                })
                .catch(error => {
                    this.activeRequests--;
                    reject(error);
                    this.processQueue(); // Process next request
                });
        }

        this.isProcessingQueue = false;
    }

    // Add request to queue
    async queueRequest(requestFn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ resolve, reject, requestFn });
            this.processQueue();
        });
    }

    // Make API request with rate limiting
    async makeRequest(endpoint, params = {}) {
        const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;
        
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
            console.log(`Using cached data for: ${endpoint}`);
            return cached.data;
        }

        return this.queueRequest(async () => {
            const url = new URL(endpoint, this.baseURL);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

            console.log(`Making API request to: ${endpoint}`, params);

            try {
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-host': 'v3.football.api-sports.io',
                        'x-rapidapi-key': this.apiKey
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Check for API errors
                if (data.errors && Object.keys(data.errors).length > 0) {
                    const errorMessage = JSON.stringify(data.errors);
                    console.error(`API Error: ${errorMessage}`);
                    throw new Error(`API Error: ${errorMessage}`);
                }

                // Cache successful response
                this.cache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });

                return data;
            } catch (error) {
                console.error(`API request error: ${error}`);
                throw error;
            }
        });
    }

    // Get today's matches with fallback data
    async getTodayMatches() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const data = await this.makeRequest('/fixtures', { date: today });
            
            // If no matches today, return fallback data
            if (!data.response || data.response.length === 0) {
                console.log('No matches today, returning fallback data');
                return this.getFallbackMatches();
            }
            
            return data;
        } catch (error) {
            console.log('API failed, returning fallback data:', error);
            return this.getFallbackMatches();
        }
    }

    // Get matches for a specific date
    async getMatchesByDate(date) {
        try {
            const data = await this.makeRequest('/fixtures', { date: date });
            
            // If no matches for date, return fallback data
            if (!data.response || data.response.length === 0) {
                console.log(`No matches for ${date}, returning fallback data`);
                return this.getFallbackMatches();
            }
            
            return data;
        } catch (error) {
            console.log('API failed, returning fallback data:', error);
            return this.getFallbackMatches();
        }
    }

    // Fallback matches data
    getFallbackMatches() {
        return {
            results: 3,
            response: [
                {
                    fixture: {
                        id: 1,
                        date: new Date().toISOString(),
                        status: { short: 'NS' }
                    },
                    teams: {
                        home: { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
                        away: { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' }
                    },
                    league: { id: 39, name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' }
                },
                {
                    fixture: {
                        id: 2,
                        date: new Date().toISOString(),
                        status: { short: 'NS' }
                    },
                    teams: {
                        home: { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' },
                        away: { id: 47, name: 'Tottenham', logo: 'https://media.api-sports.io/football/teams/47.png' }
                    },
                    league: { id: 39, name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' }
                },
                {
                    fixture: {
                        id: 3,
                        date: new Date().toISOString(),
                        status: { short: 'NS' }
                    },
                    teams: {
                        home: { id: 40, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' },
                        away: { id: 49, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' }
                    },
                    league: { id: 39, name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' }
                }
            ]
        };
    }

    // Get team statistics (simplified)
    async getTeamStatistics(teamId, leagueId, season = 2023) {
        try {
            return await this.makeRequest('/teams/statistics', {
                team: teamId,
                league: leagueId,
                season: season
            });
        } catch (error) {
            // Return fallback statistics
            return {
                response: {
                    league: { id: leagueId },
                    team: { id: teamId },
                    form: 'WWDLL',
                    fixtures: { played: { home: 10, away: 10, total: 20 } },
                    goals: { for: { total: { home: 25, away: 20, total: 45 } }, against: { total: { home: 15, away: 18, total: 33 } } },
                    clean_sheets: { home: 4, away: 3, total: 7 },
                    failed_to_score: { home: 2, away: 3, total: 5 }
                }
            };
        }
    }

    // Get head-to-head data (simplified)
    async getHeadToHead(team1Id, team2Id) {
        try {
            return await this.makeRequest('/fixtures', {
                h2h: `${team1Id}-${team2Id}`
            });
        } catch (error) {
            // Return fallback H2H data
            return { 
                results: 5, 
                response: [
                    { teams: { home: { id: team1Id }, away: { id: team2Id } }, goals: { home: 2, away: 1 } },
                    { teams: { home: { id: team2Id }, away: { id: team1Id } }, goals: { home: 0, away: 3 } },
                    { teams: { home: { id: team1Id }, away: { id: team2Id } }, goals: { home: 1, away: 1 } }
                ]
            };
        }
    }

    // Get league standings (simplified)
    async getLeagueStandings(leagueId, season = 2023) {
        try {
            return await this.makeRequest('/standings', {
                league: leagueId,
                season: season
            });
        } catch (error) {
            // Return fallback standings
            return {
                response: [{
                    league: { id: leagueId },
                    standings: [
                        { rank: 1, team: { id: 50, name: 'Manchester City' }, points: 45, all: { played: 20, win: 14, draw: 3, lose: 3 } },
                        { rank: 2, team: { id: 42, name: 'Arsenal' }, points: 43, all: { played: 20, win: 13, draw: 4, lose: 3 } },
                        { rank: 3, team: { id: 40, name: 'Liverpool' }, points: 42, all: { played: 20, win: 13, draw: 3, lose: 4 } }
                    ]
                }]
            };
        }
    }

    // Get team information (simplified)
    async getTeamInfo(teamId) {
        try {
            return await this.makeRequest('/teams', { id: teamId });
        } catch (error) {
            // Return fallback team info
            return {
                response: [{
                    team: {
                        id: teamId,
                        name: 'Team Name',
                        logo: 'https://media.api-sports.io/football/teams/default.png'
                    }
                }]
            };
        }
    }

    // Get league information (simplified)
    async getLeagueInfo(leagueId) {
        try {
            return await this.makeRequest('/leagues', { id: leagueId });
        } catch (error) {
            // Return fallback league info
            return {
                response: [{
                    league: {
                        id: leagueId,
                        name: 'League Name',
                        logo: 'https://media.api-sports.io/football/leagues/default.png'
                    }
                }]
            };
        }
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('API cache cleared');
    }

    // Force refresh - clear cache and reload
    async forceRefresh() {
        this.clearCache();
        console.log('Forcing refresh - cache cleared');
        return true;
    }

    // Get cache statistics
    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
}

// Create global instance
window.APIService = APIFootballService; 