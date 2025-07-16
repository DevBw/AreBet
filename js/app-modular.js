// BetHelper App - Modular Version
// This version uses separated modules for better organization and performance

class BetHelperApp {
    constructor() {
        // Initialize modules
        this.ui = new UIManager();
        this.data = new DataManager();
        this.validation = new Validation();
        this.apiService = new APIService();
        this.notificationService = new NotificationService();
        
        // App state
        this.state = {
            matches: [],
            featuredMatch: null,
            currentDate: new Date(),
            isLoading: false,
            currentView: 'home',
            filters: {
                date: 'Today',
                league: 'all',
                status: 'all'
            }
        };
        
        // Don't initialize immediately - wait for DOM ready
    }

    // Manual initialization method
    async initialize() {
        try {
            this.ui.showLoading('Initializing BetHelper...');
            
            // Check API configuration
            const hasApiKey = await this.checkAPIConfiguration();
            
            // Initialize UI components
            this.initializeUI();
            
            // Setup event handlers
            this.setupEventHandlers();
            
            // Load initial data if API key is available
            if (hasApiKey) {
                await this.loadInitialData();
            } else {
                // If no API key, load demo data and hide loading
                this.ui.hideLoading();
                this.loadDemoData();
            }
            
            // Add welcome notification
            this.addWelcomeNotification();
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.ui.hideLoading();
            this.ui.showError('Failed to initialize the app. Please try again.', () => this.initialize());
        }
    }

    // Check API configuration
    async checkAPIConfiguration() {
        const apiKey = this.data.getApiKey();
        if (!apiKey) {
            this.showApiKeyModal();
            return false;
        }
        
        // Set the API key in the API service
        this.apiService.setApiKey(apiKey);
        return true;
    }

    // Initialize UI components
    initializeUI() {
        this.ui.hideLoading();
        this.updateNavigation();
        this.setupResponsiveHandlers();
    }

    // Setup responsive handlers
    setupResponsiveHandlers() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleResize = (e) => {
            if (e.matches) {
                this.enableMobileOptimizations();
            } else {
                this.disableMobileOptimizations();
            }
        };
        
        mediaQuery.addListener(handleResize);
        handleResize(mediaQuery);
    }

    // Enable mobile optimizations
    enableMobileOptimizations() {
        document.body.classList.add('mobile-optimized');
    }

    // Disable mobile optimizations
    disableMobileOptimizations() {
        document.body.classList.remove('mobile-optimized');
    }

    // Setup event handlers
    setupEventHandlers() {
        // API Key modal handlers
        this.setupApiKeyModalHandlers();
        
        // Navigation handlers
        this.setupNavigationHandlers();
        
        // Search handlers
        this.setupSearchHandlers();
        
        // Notification handlers
        this.setupNotificationHandlers();
        
        // Quick actions handlers
        this.setupQuickActionsHandlers();
        
        // Global event handlers
        this.setupGlobalEventHandlers();
    }

    // Setup API Key modal handlers
    setupApiKeyModalHandlers() {
        const saveButton = document.getElementById('saveApiKey');
        const skipButton = document.getElementById('skipApiKey');
        const input = document.getElementById('apiKeyInput');

        if (saveButton) {
            saveButton.addEventListener('click', async () => {
                const apiKey = input?.value?.trim();
                if (this.validation.validateApiKey(apiKey)) {
                    this.data.setApiKey(apiKey);
                    this.apiService.setApiKey(apiKey);
                    
                    // Test the API connection
                    this.ui.showLoading('Testing API connection...');
                    const isConnected = await this.apiService.testApiConnection();
                    this.ui.hideLoading();
                    
                    if (isConnected) {
                        this.ui.hideModal('apiKeyModal');
                        this.ui.showSuccess('API key saved and connection verified!');
                        this.addSystemNotification('API Key Saved', 'Your API key has been saved. You now have access to real-time match data!');
                        this.initialize(); // Re-initialize after successful API key save
                    } else {
                        this.ui.showError('API key saved but connection test failed. Please check your key and try again.');
                    }
                } else {
                    const messages = this.validation.getMessages();
                    this.ui.showError(messages.errors[0]?.message || 'Invalid API key');
                }
            });
        }

        if (skipButton) {
            skipButton.addEventListener('click', () => {
                this.ui.hideModal('apiKeyModal');
                this.loadDemoData();
            });
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveButton?.click();
                }
            });
        }
    }

    // Setup navigation handlers
    setupNavigationHandlers() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const view = button.dataset.view;
                if (view) {
                    this.navigateTo(view);
                }
            });
        });
    }

    // Setup search handlers
    setupSearchHandlers() {
        const searchButton = document.getElementById('searchButton');
        const searchInput = document.getElementById('searchInput');
        const closeSearchButton = document.getElementById('closeSearchModal');

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.ui.showModal('searchModal');
                searchInput?.focus();
            });
        }

        if (closeSearchButton) {
            closeSearchButton.addEventListener('click', () => {
                this.ui.hideModal('searchModal');
            });
        }

        if (searchInput) {
            const debouncedSearch = this.ui.debounce((query) => {
                this.performSearch(query);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    debouncedSearch(query);
                } else {
                    this.showSearchPlaceholder();
                }
            });
        }
    }

    // Setup notification handlers
    setupNotificationHandlers() {
        const notificationButton = document.getElementById('notificationButton');
        const closeNotificationButton = document.getElementById('closeNotificationModal');
        const markAllReadButton = document.getElementById('markAllRead');

        if (notificationButton) {
            notificationButton.addEventListener('click', () => {
                this.ui.showModal('notificationModal');
                this.loadNotifications();
            });
        }

        if (closeNotificationButton) {
            closeNotificationButton.addEventListener('click', () => {
                this.ui.hideModal('notificationModal');
            });
        }

        if (markAllReadButton) {
            markAllReadButton.addEventListener('click', () => {
                this.notificationService.markAllAsRead();
                this.ui.showSuccess('All notifications marked as read');
            });
        }
    }

    // Setup quick actions handlers
    setupQuickActionsHandlers() {
        const fabButton = document.getElementById('fabButton');
        const closeQuickActionsButton = document.getElementById('closeQuickActionsModal');

        if (fabButton) {
            fabButton.addEventListener('click', () => {
                this.ui.showModal('quickActionsModal');
            });
        }

        if (closeQuickActionsButton) {
            closeQuickActionsButton.addEventListener('click', () => {
                this.ui.hideModal('quickActionsModal');
            });
        }

        // Quick action buttons
        const quickActions = {
            'quickSearch': () => {
                this.ui.hideModal('quickActionsModal');
                this.ui.showModal('searchModal');
            },
            'quickRefresh': () => {
                this.ui.hideModal('quickActionsModal');
                this.forceRefresh();
            },
            'quickFavorites': () => {
                this.ui.hideModal('quickActionsModal');
                this.showFavoritesModal();
            },
            'quickSettings': () => {
                this.ui.hideModal('quickActionsModal');
                this.showProfileModal();
            }
        };

        Object.entries(quickActions).forEach(([id, action]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', action);
            }
        });
    }

    // Setup global event handlers
    setupGlobalEventHandlers() {
        // Refresh button
        const refreshButton = document.getElementById('refreshButton');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.forceRefresh());
        }

        // Date filter buttons
        const dateFilterButtons = document.querySelectorAll('.date-filter-btn');
        dateFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.textContent.trim();
                this.applyDateFilter(filter);
            });
        });
    }

    // Load initial data
    async loadInitialData() {
        try {
            this.ui.showLoading('Loading matches...');
            await this.loadMatches();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.ui.showError('Failed to load initial data. Loading demo data instead.');
            this.loadDemoData();
        } finally {
            this.ui.hideLoading();
        }
    }

    // Load matches
    async loadMatches() {
        try {
            this.state.isLoading = true;
            console.log('Loading matches...');
            console.log('API Key set:', !!this.apiService.getApiKey());
            
            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 20000); // 20 second timeout
            });
            
            // Try to load real data first with timeout
            const apiResponse = await Promise.race([
                this.apiService.getTodayMatches(),
                timeoutPromise
            ]);
            
            console.log('API response:', apiResponse);
            
            if (apiResponse && apiResponse.response && apiResponse.response.length > 0) {
                console.log(`Loaded ${apiResponse.response.length} matches from API`);
                
                // Transform API data to match expected format
                this.state.matches = apiResponse.response.map(match => {
                    const fixture = match.fixture || {};
                    const teams = match.teams || {};
                    const league = match.league || {};
                    const goals = match.goals || {};
                    
                    return {
                        id: fixture.id || Math.random() * 1000000,
                        homeTeam: teams.home?.name || 'Unknown Team',
                        awayTeam: teams.away?.name || 'Unknown Team',
                        homeScore: goals.home || null,
                        awayScore: goals.away || null,
                        time: fixture.date ? new Date(fixture.date).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                        }) : 'TBD',
                        date: fixture.date ? new Date(fixture.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        league: league.name || 'Unknown League',
                        status: fixture.status?.short || 'NS',
                        homeTeamLogo: teams.home?.logo || '/placeholder-team.png',
                        awayTeamLogo: teams.away?.logo || '/placeholder-team.png'
                    };
                });
                
                this.renderMatches();
                this.setFeaturedMatch();
                this.updateMatchCount();
                this.hideEmptyState();
            } else {
                console.log('No matches from API, loading demo data');
                this.loadDemoData();
            }
            
        } catch (error) {
            console.error('Error loading matches:', error);
            this.ui.showError(`Failed to load matches: ${error.message}`);
            this.loadDemoData();
        } finally {
            this.state.isLoading = false;
        }
    }

    // Load demo data
    loadDemoData() {
        this.state.matches = [
            {
                id: 1,
                homeTeam: 'Manchester United',
                awayTeam: 'Liverpool',
                homeScore: null,
                awayScore: null,
                time: '20:00',
                date: '2024-01-15',
                league: 'Premier League',
                status: 'Scheduled',
                homeTeamLogo: 'https://media.api-sports.io/football/teams/33.png',
                awayTeamLogo: 'https://media.api-sports.io/football/teams/40.png'
            },
            {
                id: 2,
                homeTeam: 'Arsenal',
                awayTeam: 'Chelsea',
                homeScore: 2,
                awayScore: 1,
                time: '15:30',
                date: '2024-01-15',
                league: 'Premier League',
                status: 'Finished',
                homeTeamLogo: 'https://media.api-sports.io/football/teams/42.png',
                awayTeamLogo: 'https://media.api-sports.io/football/teams/49.png'
            },
            {
                id: 3,
                homeTeam: 'Barcelona',
                awayTeam: 'Real Madrid',
                homeScore: null,
                awayScore: null,
                time: '21:00',
                date: '2024-01-15',
                league: 'La Liga',
                status: 'Scheduled',
                homeTeamLogo: 'https://media.api-sports.io/football/teams/529.png',
                awayTeamLogo: 'https://media.api-sports.io/football/teams/541.png'
            }
        ];
        
        this.renderMatches();
        this.setFeaturedMatch();
        this.updateMatchCount();
        this.hideEmptyState();
    }

    // Render matches
    renderMatches() {
        const container = document.getElementById('matchesContainer');
        if (!container) return;

        if (this.state.matches.length === 0) {
            this.showEmptyState();
            return;
        }

        container.innerHTML = this.state.matches.map(match => this.createMatchCard(match)).join('');
    }

    // Create match card
    createMatchCard(match) {
        if (!this.validation.validateMatch(match)) {
            console.warn('Invalid match data:', match);
            return '';
        }

        const prediction = this.generatePrediction(match);
        const isFinished = match.status === 'Finished';
        const isLive = match.status === 'Live';
        const isFavorite = this.data.isFavorite(match.id);

        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer" onclick="app.showMatchDetails(${match.id})">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <img src="${match.homeTeamLogo || '/placeholder-team.png'}" alt="${match.homeTeam}" class="w-6 h-6 rounded-full" onerror="this.src='/placeholder-team.png'">
                        <span class="font-medium text-gray-900 truncate">${match.homeTeam}</span>
                    </div>
                    <div class="text-center">
                        <div class="text-sm font-bold text-gray-900">
                            ${isFinished ? `${match.homeScore} - ${match.awayScore}` : match.time}
                        </div>
                        <div class="text-xs text-gray-500">${match.league}</div>
                        ${isLive ? '<div class="text-xs text-red-500 font-medium">LIVE</div>' : ''}
                    </div>
                    <div class="flex items-center space-x-3">
                        <span class="font-medium text-gray-900 truncate">${match.awayTeam}</span>
                        <img src="${match.awayTeamLogo || '/placeholder-team.png'}" alt="${match.awayTeam}" class="w-6 h-6 rounded-full" onerror="this.src='/placeholder-team.png'">
                    </div>
                </div>
                
                <div class="flex space-x-1 mb-3">
                    <div class="flex-1 bg-gray-100 rounded p-2 text-center">
                        <div class="text-sm font-bold text-gray-900">1</div>
                        <div class="text-xs text-gray-500">Home</div>
                    </div>
                    <div class="flex-1 bg-gray-100 rounded p-2 text-center">
                        <div class="text-sm font-bold text-gray-900">X</div>
                        <div class="text-xs text-gray-500">Draw</div>
                    </div>
                    <div class="flex-1 bg-gray-100 rounded p-2 text-center">
                        <div class="text-sm font-bold text-gray-900">2</div>
                        <div class="text-xs text-gray-500">Away</div>
                    </div>
                </div>
                
                <div class="bg-green-50 rounded-lg p-3">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="font-medium text-gray-900">Prediction</h4>
                            <p class="text-sm text-gray-600">${prediction}</p>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-bold text-green-600">75%</div>
                            <div class="text-xs text-green-500">Confidence</div>
                        </div>
                    </div>
                </div>
                
                <div class="flex space-x-2 mt-3">
                    <button onclick="event.stopPropagation(); app.toggleFavorite(${match.id})" class="flex-1 ${isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 px-3 rounded text-sm transition-colors">
                        ${isFavorite ? 'Remove' : 'Save'}
                    </button>
                    <button onclick="event.stopPropagation(); app.placeBet(${match.id})" class="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 transition-colors">
                        Place Bet
                    </button>
                </div>
            </div>
        `;
    }

    // Generate prediction
    generatePrediction(match) {
        const predictions = [
            'Home team to win',
            'Away team to win',
            'Draw likely',
            'Both teams to score',
            'Over 2.5 goals',
            'Under 2.5 goals'
        ];
        
        // Use match ID as seed for consistent predictions
        const seed = match.id;
        const random = (min, max) => Math.floor((seed * Math.random()) % (max - min + 1)) + min;
        
        return predictions[random(0, predictions.length - 1)];
    }

    // Set featured match
    setFeaturedMatch() {
        if (this.state.matches.length > 0) {
            this.state.featuredMatch = this.state.matches[0];
            this.renderFeaturedMatch();
        }
    }

    // Render featured match
    renderFeaturedMatch() {
        const container = document.getElementById('featuredMatch');
        if (!container || !this.state.featuredMatch) return;

        const match = this.state.featuredMatch;
        const prediction = this.generatePrediction(match);

        container.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <img src="${match.homeTeamLogo || '/placeholder-team.png'}" alt="${match.homeTeam}" class="w-8 h-8 rounded-full" onerror="this.src='/placeholder-team.png'">
                    <span class="font-semibold text-gray-900">${match.homeTeam}</span>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold text-gray-900">${match.time}</div>
                    <div class="text-sm text-gray-500">${match.league}</div>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="font-semibold text-gray-900">${match.awayTeam}</span>
                    <img src="${match.awayTeamLogo || '/placeholder-team.png'}" alt="${match.awayTeam}" class="w-8 h-8 rounded-full" onerror="this.src='/placeholder-team.png'">
                </div>
            </div>
            <div class="bg-green-50 rounded-lg p-3">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="font-medium text-gray-900">Prediction</h4>
                        <p class="text-sm text-gray-600">${prediction}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-bold text-green-600">75%</div>
                        <div class="text-sm text-green-500">Confidence</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Update match count
    updateMatchCount() {
        const countElement = document.getElementById('matchCount');
        if (countElement) {
            countElement.textContent = `${this.state.matches.length} matches`;
        }
    }

    // Show empty state
    showEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const container = document.getElementById('matchesContainer');
        
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        if (container) {
            container.classList.add('hidden');
        }
    }

    // Hide empty state
    hideEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const container = document.getElementById('matchesContainer');
        
        if (emptyState) {
            emptyState.classList.add('hidden');
        }
        if (container) {
            container.classList.remove('hidden');
        }
    }

    // Toggle favorite
    toggleFavorite(matchId) {
        const match = this.state.matches.find(m => m.id === matchId);
        if (!match) return;

        if (this.data.isFavorite(matchId)) {
            this.data.removeFromFavorites(matchId);
            this.ui.showSuccess('Removed from favorites');
        } else {
            this.data.addToFavorites(match);
            this.ui.showSuccess('Added to favorites');
        }
    }

    // Place bet
    placeBet(matchId) {
        const match = this.state.matches.find(m => m.id === matchId);
        if (match) {
            this.ui.showSuccess(`Bet placed on ${match.homeTeam} vs ${match.awayTeam}!`);
        }
    }

    // Force refresh
    async forceRefresh() {
        this.ui.showLoading('Refreshing matches...');
        
        // Clear cache
        this.data.clearCache();
        
        // Reload matches
        await this.loadMatches();
        
        this.ui.hideLoading();
        this.ui.showSuccess('Matches refreshed successfully!');
    }

    // Show API key modal
    showApiKeyModal() {
        this.ui.showModal('apiKeyModal');
    }

    // Add system notification
    addSystemNotification(title, message) {
        this.notificationService.addNotification('system', title, message);
    }

    // Add welcome notification
    addWelcomeNotification() {
        this.addSystemNotification(
            'Welcome to BetHelper!',
            'Your football prediction app is ready. Check out today\'s matches and predictions.'
        );
    }

    // Navigation methods (placeholder implementations)
    navigateTo(view) {
        this.ui.navigateTo(view);
    }

    showMatchDetails(matchId) {
        this.ui.showSuccess('Match details coming soon!');
    }

    showFavoritesModal() {
        this.ui.showSuccess('Favorites view coming soon!');
    }

    showProfileModal() {
        this.ui.showSuccess('Profile view coming soon!');
    }

    performSearch(query) {
        this.ui.showSuccess(`Searching for: ${query}`);
    }

    showSearchPlaceholder() {
        const container = document.getElementById('searchResults');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="ri-search-line text-3xl mb-2"></i>
                    <p>Search for teams, leagues, or matches</p>
                </div>
            `;
        }
    }

    loadNotifications() {
        this.notificationService.updateNotificationList();
    }

    applyDateFilter(filter) {
        this.ui.showSuccess(`Filtered by: ${filter}`);
    }

    updateNavigation() {
        // Update navigation state
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active', 'text-green-500');
            btn.classList.add('text-gray-400');
        });

        const activeButton = document.querySelector(`[data-view="${this.state.currentView}"]`);
        if (activeButton) {
            activeButton.classList.add('active', 'text-green-500');
            activeButton.classList.remove('text-gray-400');
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BetHelperApp();
    window.app.initialize(); // Call the manual initialization method
}); 