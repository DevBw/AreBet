// API-Football Service for BetHelper
class APIFootballService {
    constructor() {
        this.baseURL = 'https://v3.football.api-sports.io';
        this.apiKey = '34217e3a7aa4a6e0acf7dfc67a7c726a';
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.lastRequestTime = 0;
        this.minRequestInterval = 6000; // 6 seconds between requests (10 per minute)
    }

    // Queue management for rate limiting
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0) {
            const { resolve, reject, requestFn } = this.requestQueue.shift();
            
            try {
                // Ensure minimum interval between requests
                const now = Date.now();
                const timeSinceLastRequest = now - this.lastRequestTime;
                if (timeSinceLastRequest < this.minRequestInterval) {
                    await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
                }

                const result = await requestFn();
                this.lastRequestTime = Date.now();
                resolve(result);
            } catch (error) {
                reject(error);
            }
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
            console.log(`Full URL: ${url.toString()}`);
            console.log(`Headers:`, {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': this.apiKey
            });

            try {
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-host': 'v3.football.api-sports.io',
                        'x-rapidapi-key': this.apiKey
                    }
                });

                console.log(`Response status: ${response.status}`);
                console.log(`Response headers:`, response.headers);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log(`API Response data:`, data);

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

    // Get today's matches
    async getTodayMatches() {
        const today = new Date().toISOString().split('T')[0];
        return this.makeRequest('/fixtures', { date: today });
    }

    // Get matches for a specific date
    async getMatchesByDate(date) {
        return this.makeRequest('/fixtures', { date: date });
    }

    // Get team statistics (with fallback for season limitations)
    async getTeamStatistics(teamId, leagueId, season = 2023) {
        try {
            return await this.makeRequest('/teams/statistics', {
                team: teamId,
                league: leagueId,
                season: season
            });
        } catch (error) {
            // If season 2023 fails, try 2022 as fallback
            if (error.message.includes('Free plans do not have access to this season') && season === 2023) {
                console.log(`Season 2023 not available, trying 2022 for team ${teamId}`);
                return this.makeRequest('/teams/statistics', {
                    team: teamId,
                    league: leagueId,
                    season: 2022
                });
            }
            throw error;
        }
    }

    // Get head-to-head data
    async getHeadToHead(team1Id, team2Id, season = 2023) {
        try {
            return await this.makeRequest('/fixtures', {
                h2h: `${team1Id}-${team2Id}`
            });
        } catch (error) {
            // If H2H fails, return empty data
            console.log(`H2H data not available for ${team1Id}-${team2Id}`);
            return { results: 0, response: [] };
        }
    }

    // Get league standings
    async getLeagueStandings(leagueId, season = 2023) {
        try {
            return await this.makeRequest('/standings', {
                league: leagueId,
                season: season
            });
        } catch (error) {
            // If season 2023 fails, try 2022 as fallback
            if (error.message.includes('Free plans do not have access to this season') && season === 2023) {
                console.log(`Season 2023 not available, trying 2022 for league ${leagueId}`);
                return this.makeRequest('/standings', {
                    league: leagueId,
                    season: 2022
                });
            }
            throw error;
        }
    }

    // Get team information
    async getTeamInfo(teamId) {
        return this.makeRequest('/teams', { id: teamId });
    }

    // Get league information
    async getLeagueInfo(leagueId) {
        return this.makeRequest('/leagues', { id: leagueId });
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('API cache cleared');
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
window.apiService = new APIFootballService(); 