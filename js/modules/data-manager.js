// Data Manager - Handles all data operations, caching, and persistence
class DataManager {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
        this.storagePrefix = 'betHelper_';
        
        this.initializeStorage();
    }

    // Initialize storage and load cached data
    initializeStorage() {
        // Load cache from localStorage
        try {
            const cachedData = localStorage.getItem(this.storagePrefix + 'cache');
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                const now = Date.now();
                
                // Only load non-expired cache entries
                Object.entries(parsed).forEach(([key, value]) => {
                    if (now - value.timestamp < this.cacheExpiry) {
                        this.cache.set(key, value);
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load cache from storage:', error);
        }
    }

    // Cache management
    setCache(key, data, expiry = this.cacheExpiry) {
        const cacheEntry = {
            data: data,
            timestamp: Date.now(),
            expiry: expiry
        };
        
        this.cache.set(key, cacheEntry);
        this.saveCacheToStorage();
    }

    getCache(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        
        const now = Date.now();
        if (now - entry.timestamp > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.data;
    }

    clearCache() {
        this.cache.clear();
        localStorage.removeItem(this.storagePrefix + 'cache');
    }

    saveCacheToStorage() {
        try {
            const cacheData = {};
            this.cache.forEach((value, key) => {
                cacheData[key] = value;
            });
            localStorage.setItem(this.storagePrefix + 'cache', JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to save cache to storage:', error);
        }
    }

    // Local storage management
    setItem(key, value) {
        try {
            localStorage.setItem(this.storagePrefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }

    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.storagePrefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    }

    removeItem(key) {
        try {
            localStorage.removeItem(this.storagePrefix + key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }

    // User preferences
    setUserPreference(key, value) {
        const preferences = this.getItem('userPreferences', {});
        preferences[key] = value;
        return this.setItem('userPreferences', preferences);
    }

    getUserPreference(key, defaultValue = null) {
        const preferences = this.getItem('userPreferences', {});
        return preferences[key] !== undefined ? preferences[key] : defaultValue;
    }

    // Favorites management
    addToFavorites(match) {
        const favorites = this.getItem('favorites', []);
        const exists = favorites.find(f => f.id === match.id);
        
        if (!exists) {
            favorites.push({
                ...match,
                addedAt: new Date().toISOString()
            });
            this.setItem('favorites', favorites);
            return true;
        }
        return false;
    }

    removeFromFavorites(matchId) {
        const favorites = this.getItem('favorites', []);
        const filtered = favorites.filter(f => f.id !== matchId);
        this.setItem('favorites', filtered);
        return favorites.length !== filtered.length;
    }

    getFavorites() {
        return this.getItem('favorites', []);
    }

    isFavorite(matchId) {
        const favorites = this.getItem('favorites', []);
        return favorites.some(f => f.id === matchId);
    }

    // API key management
    setApiKey(apiKey) {
        return this.setItem('apiKey', apiKey);
    }

    getApiKey() {
        return this.getItem('apiKey', null);
    }

    hasApiKey() {
        return !!this.getApiKey();
    }

    // Data validation
    validateMatchData(match) {
        const required = ['id', 'homeTeam', 'awayTeam', 'time', 'date', 'league'];
        return required.every(field => match[field] !== undefined && match[field] !== null);
    }

    validateApiKey(apiKey) {
        return apiKey && typeof apiKey === 'string' && apiKey.length > 0;
    }

    // Data export/import
    exportData() {
        const data = {
            favorites: this.getFavorites(),
            preferences: this.getItem('userPreferences', {}),
            apiKey: this.getApiKey(),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.favorites) {
                this.setItem('favorites', data.favorites);
            }
            
            if (data.preferences) {
                this.setItem('userPreferences', data.preferences);
            }
            
            if (data.apiKey) {
                this.setApiKey(data.apiKey);
            }
            
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, message: 'Invalid data format' };
        }
    }

    // Data cleanup
    cleanupOldData() {
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        
        // Clean up old cache entries
        this.cache.forEach((entry, key) => {
            if (now - entry.timestamp > maxAge) {
                this.cache.delete(key);
            }
        });
        
        this.saveCacheToStorage();
    }

    // Statistics
    getStorageStats() {
        const stats = {
            cacheSize: this.cache.size,
            localStorageSize: 0,
            favoritesCount: this.getFavorites().length,
            hasApiKey: this.hasApiKey()
        };
        
        try {
            stats.localStorageSize = JSON.stringify(localStorage).length;
        } catch (error) {
            console.warn('Could not calculate localStorage size:', error);
        }
        
        return stats;
    }

    // Backup and restore
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            data: this.exportData(),
            version: '1.0.0'
        };
        
        return JSON.stringify(backup, null, 2);
    }

    restoreFromBackup(backupData) {
        try {
            const backup = JSON.parse(backupData);
            return this.importData(backup.data);
        } catch (error) {
            return { success: false, message: 'Invalid backup format' };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
} 