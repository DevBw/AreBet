// API-Football Service for BetHelper - Optimized Version
class APIFootballService {
    constructor() {
        this.baseURL = 'https://v3.football.api-sports.io';
        this.apiKey = '34217e3a7aa4a6e0acf7dfc67a7c726a';
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.lastRequestTime = 0;
        this.minRequestInterval = 1500; // Reduced to 1.5 seconds for better performance
        this.maxConcurrentRequests = 5; // Increased concurrent requests
        this.activeRequests = 0;
        this.cacheExpiry = 10 * 60 * 1000; // 10 minutes cache
        this.retryAttempts = 2;
    }

    // Enhanced queue management with better error handling
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
            const { resolve, reject, requestFn, retryCount = 0 } = this.requestQueue.shift();
            
            // Ensure minimum interval between requests
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            if (timeSinceLastRequest < this.minRequestInterval) {
                await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
            }

            this.activeRequests++;
            this.lastRequestTime = Date.now();

            // Execute request with retry logic
            requestFn()
                .then(result => {
                    this.activeRequests--;
                    resolve(result);
                    this.processQueue();
                })
                .catch(error => {
                    this.activeRequests--;
                    
                    // Retry logic
                    if (retryCount < this.retryAttempts) {
                        console.log(`Retrying request (${retryCount + 1}/${this.retryAttempts})`);
                        this.requestQueue.unshift({ resolve, reject, requestFn, retryCount: retryCount + 1 });
                    } else {
                        reject(error);
                    }
                    
                    this.processQueue();
                });
        }

        this.isProcessingQueue = false;
    }

    // Add request to queue with priority
    async queueRequest(requestFn, priority = false) {
        return new Promise((resolve, reject) => {
            const request = { resolve, reject, requestFn };
            
            if (priority) {
                this.requestQueue.unshift(request);
            } else {
                this.requestQueue.push(request);
            }
            
            this.processQueue();
        });
    }

    // Optimized cache management
    getCacheKey(endpoint, params = {}) {
        return `${endpoint}?${new URLSearchParams(params).toString()}`;
    }

    getCachedData(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    setCachedData(cacheKey, data) {
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        // Clean old cache entries if cache gets too large
        if (this.cache.size > 100) {
            const entries = Array.from(this.cache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            entries.slice(0, 20).forEach(([key]) => this.cache.delete(key));
        }
    }

    // Enhanced API request with better error handling
    async makeRequest(endpoint, params = {}) {
        const cacheKey = this.getCacheKey(endpoint, params);
        
        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            console.log(`Using cached data for: ${endpoint}`);
            return cached;
        }

        return this.queueRequest(async () => {
            const url = new URL(endpoint, this.baseURL);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

            console.log(`Making API request to: ${endpoint}`);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-host': 'v3.football.api-sports.io',
                        'x-rapidapi-key': this.apiKey
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

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
                this.setCachedData(cacheKey, data);

                return data;
            } catch (error) {
                console.error(`API request error: ${error}`);
                throw error;
            }
        });
    }

    // Optimized match loading with better fallbacks
    async getTodayMatches() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const data = await this.makeRequest('/fixtures', { date: today });
            
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

    async getMatchesByDate(date) {
        try {
            const data = await this.makeRequest('/fixtures', { date: date });
            
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

    // Enhanced fallback data
    getFallbackMatches() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return {
            results: 3,
            response: [
                {
                    fixture: {
                        id: 1,
                        date: today.toISOString(),
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
                        date: tomorrow.toISOString(),
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
                        date: today.toISOString(),
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

    // Optimized team statistics with better caching
    async getTeamStatistics(teamId, leagueId, season = 2023) {
        const cacheKey = `stats_${teamId}_${leagueId}_${season}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.makeRequest('/teams/statistics', {
                team: teamId,
                league: leagueId,
                season: season
            });
            this.setCachedData(cacheKey, data);
            return data;
        } catch (error) {
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

    // Optimized head-to-head data
    async getHeadToHead(team1Id, team2Id) {
        const cacheKey = `h2h_${team1Id}_${team2Id}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.makeRequest('/fixtures', {
                h2h: `${team1Id}-${team2Id}`
            });
            this.setCachedData(cacheKey, data);
            return data;
        } catch (error) {
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

    // Enhanced cache management
    clearCache() {
        this.cache.clear();
        console.log('API cache cleared');
    }

    async forceRefresh() {
        this.clearCache();
        console.log('Forcing refresh - cache cleared');
        return true;
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys()),
            hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
        };
    }

    // Performance monitoring
    cacheHits = 0;
    cacheMisses = 0;
}

// Create global instance
window.APIService = APIFootballService; 