// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://v3.football.api-sports.io',
    API_KEY: '34217e3a7aa4a6e0acf7dfc67a7c726a', // Your API key
    DEFAULT_SEASON: 2023, // Changed from 2025 to 2023 for free plan compatibility
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
    REQUEST_DELAY: 1000, // 1 second delay between requests to respect rate limits
    MAX_RETRIES: 3
};

// App Configuration
const APP_CONFIG = {
    DEFAULT_DATE_FILTER: 'Today',
    MATCHES_PER_PAGE: 10,
    FEATURED_MATCH_INDEX: 0,
    ANIMATION_DURATION: 300,
    REFRESH_INTERVAL: 5 * 60 * 1000 // 5 minutes
};

// Export configurations
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, APP_CONFIG };
} 