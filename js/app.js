// BetHelper App - Main Application Logic
class BetHelperApp {
    constructor() {
        this.apiService = new APIService();
        this.notificationService = new NotificationService();
        this.matches = [];
        this.featuredMatch = null;
        this.currentDate = new Date();
        this.isLoading = false;
        this.cache = new Map();
        this.debounceTimer = null;
        
        this.init();
    }

    async init() {
        try {
            this.updateLoadingStatus('Checking API configuration...');
            
            // Check if API key exists
            const apiKey = localStorage.getItem('apiFootballKey');
            if (!apiKey) {
                this.showApiKeyModal();
                return;
            }

            // Show content immediately with loading state
            this.hideLoading();
            this.showLoadingMatches();
            
            this.updateLoadingStatus('Loading matches...');
            await this.loadMatches();
            
            // Add welcome notification
            this.addSystemNotification(
                'Welcome to BetHelper!',
                'Your football prediction app is ready. Check out today\'s matches and predictions.'
            );
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.showError('Failed to initialize the app. Please try again.');
        }
    }

    // Loading and Status Management
    updateLoadingStatus(message) {
        const statusElement = document.getElementById('loadingStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    showLoadingMatches() {
        const container = document.getElementById('matchesContainer');
        if (container) {
            container.innerHTML = `
                <div class="space-y-4">
                    ${Array(3).fill().map(() => `
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div class="animate-pulse">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-6 h-6 bg-gray-200 rounded-full"></div>
                                        <div class="h-4 bg-gray-200 rounded w-24"></div>
                                    </div>
                                    <div class="text-center">
                                        <div class="h-3 bg-gray-200 rounded w-8 mb-1"></div>
                                        <div class="h-2 bg-gray-200 rounded w-12"></div>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <div class="h-4 bg-gray-200 rounded w-20"></div>
                                        <div class="w-6 h-6 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                                <div class="flex space-x-1 mb-3">
                                    <div class="flex-1 bg-gray-100 rounded p-2">
                                        <div class="h-4 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                                        <div class="h-2 bg-gray-200 rounded w-12 mx-auto"></div>
                                    </div>
                                    <div class="flex-1 bg-gray-100 rounded p-2">
                                        <div class="h-4 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                                        <div class="h-2 bg-gray-200 rounded w-12 mx-auto"></div>
                                    </div>
                                    <div class="flex-1 bg-gray-100 rounded p-2">
                                        <div class="h-4 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                                        <div class="h-2 bg-gray-200 rounded w-12 mx-auto"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    hideLoadingMatches() {
        // Loading matches will be replaced by actual content
    }

    // Error Handling
    showError(message, retryCallback = null) {
        const modal = document.getElementById('errorModal');
        const messageElement = document.getElementById('errorMessage');
        const retryButton = document.getElementById('retryButton');
        
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        if (modal) {
            modal.classList.remove('hidden');
        }

        if (retryCallback && retryButton) {
            retryButton.onclick = () => {
                this.hideError();
                retryCallback();
            };
        }
    }

    hideError() {
        const modal = document.getElementById('errorModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Success Toast with debouncing
    showSuccess(message, duration = 3000) {
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        const toast = document.getElementById('successToast');
        const messageElement = document.getElementById('successMessage');
        
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        if (toast) {
            toast.classList.remove('translate-x-full');
            
            this.debounceTimer = setTimeout(() => {
                toast.classList.add('translate-x-full');
            }, duration);
        }
    }

    // API Key Modal
    showApiKeyModal() {
        const modal = document.getElementById('apiKeyModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        this.setupApiKeyModalHandlers();
    }

    hideApiKeyModal() {
        const modal = document.getElementById('apiKeyModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    setupApiKeyModalHandlers() {
        const saveButton = document.getElementById('saveApiKey');
        const skipButton = document.getElementById('skipApiKey');
        const input = document.getElementById('apiKeyInput');

        if (saveButton) {
            saveButton.onclick = () => {
                const apiKey = input?.value?.trim();
                if (apiKey) {
                    localStorage.setItem('apiFootballKey', apiKey);
                    this.hideApiKeyModal();
                    this.showSuccess('API key saved successfully!');
                    this.addSystemNotification(
                        'API Key Saved',
                        'Your API key has been saved. You now have access to real-time match data!'
                    );
                    this.init(); // Restart initialization
                } else {
                    this.showError('Please enter a valid API key.');
                }
            };
        }

        if (skipButton) {
            skipButton.onclick = () => {
                console.log('Skip button clicked');
                this.hideApiKeyModal();
                // Add a small delay to ensure modal is hidden
                setTimeout(() => {
                    console.log('Loading demo data...');
                    this.loadDemoData();
                }, 100);
            };
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveButton?.click();
                }
            });
        }
    }

    // Match Loading with caching
    async loadMatches() {
        try {
            this.isLoading = true;
            
            const today = new Date().toISOString().split('T')[0];
            
            // Check cache first
            const cacheKey = `matches_${today}`;
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData && Date.now() - cachedData.timestamp < 5 * 60 * 1000) { // 5 minutes
                this.matches = cachedData.data?.response || [];
                this.updateMatchCount();
                this.renderMatches();
                this.setFeaturedMatch();
                return;
            }
            
            const matches = await this.apiService.getMatchesByDate(today);
            
            this.matches = matches?.response || [];
            
            // Cache the data
            this.cache.set(cacheKey, {
                data: matches,
                timestamp: Date.now()
            });
            
            this.updateMatchCount();
            
            if (this.matches.length === 0) {
                this.showEmptyState();
            } else {
                this.hideEmptyState();
                this.renderMatches();
                this.setFeaturedMatch();
                
                // Add notification for new matches loaded
                this.addSystemNotification(
                    'Matches Loaded',
                    `Loaded ${this.matches.length} matches for today`
                );
            }
            
        } catch (error) {
            console.error('Error loading matches:', error);
            this.showError('Failed to load matches. Please check your API key or try again later.', () => this.loadMatches());
        } finally {
            this.isLoading = false;
            this.hideLoadingMatches();
        }
    }

    // Demo Data (fallback)
    loadDemoData() {
        console.log('loadDemoData called');
        // Clear any loading states first
        this.hideLoading();
        this.hideLoadingMatches();
        
        console.log('Loading states cleared');
        
        this.matches = [
            {
                fixture: {
                    id: 1,
                    date: new Date().toISOString()
                },
                teams: {
                    home: { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
                    away: { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' }
                },
                league: { id: 39, name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' }
            }
        ];
        
        console.log('Demo matches set:', this.matches);
        
        this.updateMatchCount();
        this.renderMatches();
        this.setFeaturedMatch();
        this.showSuccess('Demo mode activated. Get an API key for real data!');
        
        // Add demo notifications
        this.generateDemoNotifications();
        
        console.log('Demo data loaded successfully');
    }

    // UI Updates
    updateMatchCount() {
        const countElement = document.getElementById('matchCount');
        if (countElement) {
            countElement.textContent = `${this.matches.length} match${this.matches.length !== 1 ? 'es' : ''}`;
        }
    }

    showEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const container = document.getElementById('matchesContainer');
        
        if (emptyState) emptyState.classList.remove('hidden');
        if (container) container.classList.add('hidden');
    }

    hideEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const container = document.getElementById('matchesContainer');
        
        if (emptyState) emptyState.classList.add('hidden');
        if (container) container.classList.remove('hidden');
    }

    setFeaturedMatch() {
        if (this.matches.length > 0) {
            this.featuredMatch = this.matches[0];
            this.renderFeaturedMatch();
        }
    }

    renderFeaturedMatch() {
        const container = document.getElementById('featuredMatch');
        if (!container || !this.featuredMatch) return;

        const match = this.featuredMatch;
        const prediction = this.generatePrediction(match);

        container.innerHTML = `
            <div class="flex items-center justify-between mb-4 min-w-0">
                <div class="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy">
                    <span class="font-semibold text-gray-900 truncate text-sm sm:text-base">${match.teams.home.name}</span>
                </div>
                <div class="text-center flex-shrink-0 mx-2">
                    <div class="text-sm text-gray-500">VS</div>
                    <div class="text-xs text-gray-400">${this.formatDate(match.fixture.date)}</div>
                </div>
                <div class="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 justify-end">
                    <span class="font-semibold text-gray-900 truncate text-sm sm:text-base">${match.teams.away.name}</span>
                    <img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy">
                </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-700">Win Probability</span>
                    <span class="text-sm font-semibold text-green-600">${prediction.confidence}% confidence</span>
                </div>
                <div class="flex space-x-2 mb-3">
                    <div class="flex-1 bg-white rounded p-2 text-center min-w-0">
                        <div class="text-lg font-bold text-gray-900">${prediction.homeWin}%</div>
                        <div class="text-xs text-gray-500">Home</div>
                    </div>
                    <div class="flex-1 bg-white rounded p-2 text-center min-w-0">
                        <div class="text-lg font-bold text-gray-900">${prediction.draw}%</div>
                        <div class="text-xs text-gray-500">Draw</div>
                    </div>
                    <div class="flex-1 bg-white rounded p-2 text-center min-w-0">
                        <div class="text-lg font-bold text-gray-900">${prediction.awayWin}%</div>
                        <div class="text-xs text-gray-500">Away</div>
                    </div>
                </div>
                <div class="text-center">
                    <span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ${prediction.recommendation}
                    </span>
                </div>
            </div>
            
            <div class="flex space-x-2">
                <button onclick="app.saveMatch(${match.fixture.id})" class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    <i class="ri-heart-line mr-2"></i>Save
                </button>
                <button onclick="app.placeBet(${match.fixture.id})" class="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                    <i class="ri-money-dollar-circle-line mr-2"></i>Bet Now
                </button>
            </div>
        `;
    }

    renderMatches() {
        const container = document.getElementById('matchesContainer');
        if (!container) return;

        container.innerHTML = this.matches.map(match => this.createMatchCard(match)).join('');
    }

    createMatchCard(match) {
        // Generate prediction data for the match
        const prediction = this.generatePrediction(match);
        const confidenceColor = prediction.confidence >= 80 ? 'text-green-600' : 
                               prediction.confidence >= 60 ? 'text-yellow-600' : 'text-red-600';

        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-3 min-w-0">
                    <div class="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="w-6 h-6 rounded-full flex-shrink-0" loading="lazy">
                        <span class="font-medium text-gray-900 truncate text-sm sm:text-base">${match.teams.home.name}</span>
                    </div>
                    <div class="text-center flex-shrink-0 mx-2">
                        <div class="text-sm text-gray-500">VS</div>
                        <div class="text-xs text-gray-400">${this.formatTime(match.fixture.date)}</div>
                    </div>
                    <div class="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 justify-end">
                        <span class="font-medium text-gray-900 truncate text-sm sm:text-base">${match.teams.away.name}</span>
                        <img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="w-6 h-6 rounded-full flex-shrink-0" loading="lazy">
                    </div>
                </div>
                
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm text-gray-500 truncate flex-1 mr-2">${match.league.name}</span>
                    <span class="text-sm font-semibold ${confidenceColor} flex-shrink-0">${prediction.confidence}% confidence</span>
                </div>
                
                <div class="flex space-x-1 mb-3">
                    <div class="flex-1 bg-gray-100 rounded p-2 text-center min-w-0">
                        <div class="text-sm font-bold text-gray-900">${prediction.homeWin}%</div>
                        <div class="text-xs text-gray-500">Home</div>
                    </div>
                    <div class="flex-1 bg-gray-100 rounded p-2 text-center min-w-0">
                        <div class="text-sm font-bold text-gray-900">${prediction.draw}%</div>
                        <div class="text-xs text-gray-500">Draw</div>
                    </div>
                    <div class="flex-1 bg-gray-100 rounded p-2 text-center min-w-0">
                        <div class="text-sm font-bold text-gray-900">${prediction.awayWin}%</div>
                        <div class="text-xs text-gray-500">Away</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 truncate flex-1 mr-2">
                        <i class="ri-target-line mr-1"></i>
                        Expected: ${prediction.expectedGoals} goals
                    </span>
                    <div class="flex space-x-2 flex-shrink-0">
                        <button onclick="app.saveMatch(${match.fixture.id})" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <i class="ri-heart-line"></i>
                        </button>
                        <button onclick="app.placeBet(${match.fixture.id})" class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors">
                            Bet
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generatePrediction(match) {
        // Simple prediction algorithm based on team IDs
        const homeId = match.teams.home.id;
        const awayId = match.teams.away.id;
        
        // Use team IDs to generate consistent predictions
        const seed = homeId + awayId;
        const random = (seed * 9301 + 49297) % 233280;
        const normalized = random / 233280;
        
        const homeWin = Math.round(40 + normalized * 40); // 40-80%
        const draw = Math.round(15 + normalized * 20); // 15-35%
        const awayWin = 100 - homeWin - draw;
        
        const confidence = Math.round(60 + normalized * 30); // 60-90%
        const expectedGoals = (2 + normalized * 2).toFixed(1); // 2-4 goals
        
        let recommendation = 'Home Win';
        if (awayWin > homeWin) {
            recommendation = 'Away Win';
        } else if (draw > homeWin && draw > awayWin) {
            recommendation = 'Draw';
        }
        
        return {
            homeWin,
            draw,
            awayWin,
            confidence,
            recommendation,
            expectedGoals
        };
    }

    // Actions
    saveMatch(matchId) {
        const savedMatches = JSON.parse(localStorage.getItem('savedMatches') || '[]');
        if (!savedMatches.includes(matchId)) {
            savedMatches.push(matchId);
            localStorage.setItem('savedMatches', JSON.stringify(savedMatches));
            this.showSuccess('Match saved to favorites!');
            this.addPredictionNotification(this.matches.find(m => m.fixture.id === matchId));
        } else {
            this.showSuccess('Match already saved!');
        }
    }

    placeBet(matchId) {
        const match = this.matches.find(m => m.fixture.id === matchId);
        if (match) {
            this.showSuccess(`Redirecting to betting platform for ${match.teams.home.name} vs ${match.teams.away.name}...`);
            // In a real app, this would redirect to a betting platform
            setTimeout(() => {
                window.open('https://www.bet365.com', '_blank');
            }, 1000);
            this.addPredictionNotification(match);
        }
    }

    // Force refresh to clear cache and reload
    async forceRefresh() {
        try {
            this.cache.clear();
            await this.apiService.forceRefresh();
            this.showSuccess('Cache cleared, reloading data...');
            await this.loadMatches();
        } catch (error) {
            console.error('Force refresh error:', error);
            this.showError('Failed to refresh data');
        }
    }

    // Utility Functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Event Handlers with performance optimizations
    setupEventHandlers() {
        // Date filter buttons with event delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('date-filter-btn')) {
                document.querySelectorAll('.date-filter-btn').forEach(b => {
                    b.classList.remove('active', 'bg-green-500', 'text-white');
                    b.classList.add('bg-gray-200', 'text-gray-700');
                });
                e.target.classList.add('active', 'bg-green-500', 'text-white');
                e.target.classList.remove('bg-gray-200', 'text-gray-700');
                
                this.showSuccess('Date filter updated!');
            }
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshButton');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.forceRefresh();
            });
        }

        // Load more days button
        const loadMoreBtn = document.getElementById('loadMoreDays');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.showSuccess('Loading more days...');
                // TODO: Implement loading more days
            });
        }

        // Error modal close button
        const closeErrorBtn = document.getElementById('closeErrorModal');
        if (closeErrorBtn) {
            closeErrorBtn.addEventListener('click', () => {
                this.hideError();
            });
        }

        // Navigation buttons with event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-btn')) {
                document.querySelectorAll('.nav-btn').forEach(b => {
                    b.classList.remove('active', 'text-green-500');
                    b.classList.add('text-gray-400');
                });
                e.target.closest('.nav-btn').classList.add('active', 'text-green-500');
                e.target.closest('.nav-btn').classList.remove('text-gray-400');
                
                this.showSuccess('Navigation updated!');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.forceRefresh();
            }
        });

        // Setup search modal handlers
        this.setupSearchModalHandlers();
        
        // Setup notification modal handlers
        this.setupNotificationModalHandlers();
        
        // Setup FAB and quick actions handlers
        this.setupQuickActionsHandlers();
        
        // Setup profile modal handlers
        this.setupProfileModalHandlers();
        
        // Setup favorites modal handlers
        this.setupFavoritesModalHandlers();
        
        // Setup schedule modal handlers
        this.setupScheduleModalHandlers();
        
        // Setup home modal handlers
        this.setupHomeModalHandlers();
        
        // Setup match details modal handlers
        this.setupMatchDetailsModalHandlers();
    }

    // Search Modal
    showSearchModal() {
        const modal = document.getElementById('searchModal');
        if (modal) {
            modal.classList.remove('hidden');
            // Focus on search input
            setTimeout(() => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 100);
        }
        
        this.setupSearchModalHandlers();
    }

    hideSearchModal() {
        const modal = document.getElementById('searchModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    setupSearchModalHandlers() {
        const searchButton = document.getElementById('searchButton');
        const closeButton = document.getElementById('closeSearchModal');
        const searchInput = document.getElementById('searchInput');
        const filterButtons = document.querySelectorAll('.search-filter-btn');

        if (searchButton) {
            searchButton.onclick = () => this.showSearchModal();
        }

        if (closeButton) {
            closeButton.onclick = () => this.hideSearchModal();
        }

        if (searchInput) {
            // Debounced search
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });

            // Search on Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }

        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => {
                    btn.classList.remove('active', 'bg-green-500', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                });
                button.classList.add('active', 'bg-green-500', 'text-white');
                button.classList.remove('bg-gray-200', 'text-gray-700');
                
                // Re-search with current filter
                const currentSearch = searchInput?.value || '';
                this.performSearch(currentSearch, button.textContent.trim());
            });
        });
    }

    async performSearch(query, filter = 'All') {
        if (!query.trim()) {
            this.showSearchPlaceholder();
            return;
        }

        this.showSearchLoading();
        
        try {
            let results = [];
            
            if (filter === 'All' || filter === 'Teams') {
                const teamResults = await this.searchTeams(query);
                results = results.concat(teamResults);
            }
            
            if (filter === 'All' || filter === 'Leagues') {
                const leagueResults = await this.searchLeagues(query);
                results = results.concat(leagueResults);
            }
            
            if (filter === 'All' || filter === 'Matches') {
                const matchResults = await this.searchMatches(query);
                results = results.concat(matchResults);
            }
            
            this.displaySearchResults(results, query);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showSearchError('Search failed. Please try again.');
        }
    }

    async searchTeams(query) {
        // For demo purposes, return mock team data
        const mockTeams = [
            { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png', type: 'team' },
            { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png', type: 'team' },
            { id: 40, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png', type: 'team' },
            { id: 47, name: 'Tottenham', logo: 'https://media.api-sports.io/football/teams/47.png', type: 'team' },
            { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png', type: 'team' }
        ];
        
        return mockTeams.filter(team => 
            team.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    async searchLeagues(query) {
        // For demo purposes, return mock league data
        const mockLeagues = [
            { id: 39, name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png', type: 'league' },
            { id: 140, name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png', type: 'league' },
            { id: 78, name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png', type: 'league' },
            { id: 61, name: 'Ligue 1', logo: 'https://media.api-sports.io/football/leagues/61.png', type: 'league' },
            { id: 135, name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png', type: 'league' }
        ];
        
        return mockLeagues.filter(league => 
            league.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    async searchMatches(query) {
        // For demo purposes, return mock match data
        const mockMatches = [
            { 
                id: 1, 
                homeTeam: 'Manchester City', 
                awayTeam: 'Arsenal',
                date: new Date().toISOString(),
                league: 'Premier League',
                type: 'match'
            },
            { 
                id: 2, 
                homeTeam: 'Liverpool', 
                awayTeam: 'Tottenham',
                date: new Date(Date.now() + 86400000).toISOString(),
                league: 'Premier League',
                type: 'match'
            }
        ];
        
        return mockMatches.filter(match => 
            match.homeTeam.toLowerCase().includes(query.toLowerCase()) ||
            match.awayTeam.toLowerCase().includes(query.toLowerCase()) ||
            match.league.toLowerCase().includes(query.toLowerCase())
        );
    }

    displaySearchResults(results, query) {
        const container = document.getElementById('searchResults');
        const loading = document.getElementById('searchLoading');
        
        if (loading) loading.classList.add('hidden');
        
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="ri-search-line text-3xl mb-2"></i>
                    <p>No results found for "${query}"</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = results.map(result => {
            if (result.type === 'team') {
                return `
                    <div class="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onclick="app.selectSearchResult('team', ${result.id})">
                        <img src="${result.logo}" alt="${result.name}" class="w-8 h-8 rounded-full mr-3">
                        <div class="flex-1">
                            <div class="font-medium text-gray-900">${result.name}</div>
                            <div class="text-sm text-gray-500">Team</div>
                        </div>
                        <i class="ri-arrow-right-s-line text-gray-400"></i>
                    </div>
                `;
            } else if (result.type === 'league') {
                return `
                    <div class="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onclick="app.selectSearchResult('league', ${result.id})">
                        <img src="${result.logo}" alt="${result.name}" class="w-8 h-8 rounded mr-3">
                        <div class="flex-1">
                            <div class="font-medium text-gray-900">${result.name}</div>
                            <div class="text-sm text-gray-500">League</div>
                        </div>
                        <i class="ri-arrow-right-s-line text-gray-400"></i>
                    </div>
                `;
            } else if (result.type === 'match') {
                return `
                    <div class="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onclick="app.selectSearchResult('match', ${result.id})">
                        <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <i class="ri-football-line text-green-600"></i>
                        </div>
                        <div class="flex-1">
                            <div class="font-medium text-gray-900">${result.homeTeam} vs ${result.awayTeam}</div>
                            <div class="text-sm text-gray-500">${result.league} • ${this.formatDate(result.date)}</div>
                        </div>
                        <i class="ri-arrow-right-s-line text-gray-400"></i>
                    </div>
                `;
            }
        }).join('');
    }

    selectSearchResult(type, id) {
        this.hideSearchModal();
        
        if (type === 'team') {
            this.showSuccess(`Selected team with ID: ${id}`);
            // TODO: Load team-specific matches
        } else if (type === 'league') {
            this.showSuccess(`Selected league with ID: ${id}`);
            // TODO: Load league-specific matches
        } else if (type === 'match') {
            this.showSuccess(`Selected match with ID: ${id}`);
            // TODO: Show match details
        }
    }

    showSearchLoading() {
        const container = document.getElementById('searchResults');
        const loading = document.getElementById('searchLoading');
        
        if (container) container.classList.add('hidden');
        if (loading) loading.classList.remove('hidden');
    }

    showSearchPlaceholder() {
        const container = document.getElementById('searchResults');
        const loading = document.getElementById('searchLoading');
        
        if (loading) loading.classList.add('hidden');
        if (container) {
            container.classList.remove('hidden');
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="ri-search-line text-3xl mb-2"></i>
                    <p>Search for teams, leagues, or matches</p>
                </div>
            `;
        }
    }

    showSearchError(message) {
        const container = document.getElementById('searchResults');
        const loading = document.getElementById('searchLoading');
        
        if (loading) loading.classList.add('hidden');
        if (container) {
            container.classList.remove('hidden');
            container.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="ri-error-warning-line text-3xl mb-2"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    // Notification Modal Methods
    showNotificationModal() {
        const modal = document.getElementById('notificationModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.notificationService.updateNotificationList();
        }
    }

    hideNotificationModal() {
        const modal = document.getElementById('notificationModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    setupNotificationModalHandlers() {
        const notificationButton = document.getElementById('notificationButton');
        const closeButton = document.getElementById('closeNotificationModal');
        const markAllReadButton = document.getElementById('markAllRead');
        const filterButtons = document.querySelectorAll('.notification-filter-btn');

        if (notificationButton) {
            notificationButton.onclick = () => this.showNotificationModal();
        }

        if (closeButton) {
            closeButton.onclick = () => this.hideNotificationModal();
        }

        if (markAllReadButton) {
            markAllReadButton.onclick = () => {
                this.notificationService.markAllAsRead();
                this.showSuccess('All notifications marked as read');
            };
        }

        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => {
                    btn.classList.remove('active', 'bg-green-500', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                });
                button.classList.add('active', 'bg-green-500', 'text-white');
                button.classList.remove('bg-gray-200', 'text-gray-700');
                
                this.notificationService.setFilter(button.textContent.trim());
            });
        });

        // Handle notification item clicks and deletions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-item')) {
                const notificationId = parseFloat(e.target.closest('.notification-item').dataset.id);
                if (notificationId && !e.target.closest('.delete-notification')) {
                    this.notificationService.markAsRead(notificationId);
                }
            }

            if (e.target.closest('.delete-notification')) {
                const notificationId = parseFloat(e.target.closest('.delete-notification').dataset.id);
                if (notificationId) {
                    this.notificationService.deleteNotification(notificationId);
                    this.showSuccess('Notification deleted');
                }
            }
        });
    }

    // Add notification methods for integration with app events
    addMatchUpdateNotification(match) {
        this.notificationService.addNotification(
            this.notificationService.notificationTypes.MATCH_UPDATE,
            'Match Update',
            `${match.homeTeam} vs ${match.awayTeam} - ${match.status || 'Live'}`,
            { matchId: match.id }
        );
    }

    addPredictionNotification(match) {
        this.notificationService.addNotification(
            this.notificationService.notificationTypes.PREDICTION,
            'New Prediction',
            `High confidence prediction for ${match.homeTeam} vs ${match.awayTeam}`,
            { matchId: match.id }
        );
    }

    addSystemNotification(title, message) {
        this.notificationService.addNotification(
            this.notificationService.notificationTypes.SYSTEM,
            title,
            message
        );
    }

    // Generate demo notifications for testing
    generateDemoNotifications() {
        this.notificationService.generateDemoNotifications();
    }

    // Quick Actions Modal Methods
    showQuickActionsModal() {
        const modal = document.getElementById('quickActionsModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideQuickActionsModal() {
        const modal = document.getElementById('quickActionsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    setupQuickActionsHandlers() {
        const fabButton = document.getElementById('fabButton');
        const closeButton = document.getElementById('closeQuickActionsModal');
        const quickSearchButton = document.getElementById('quickSearch');
        const quickRefreshButton = document.getElementById('quickRefresh');
        const quickFavoritesButton = document.getElementById('quickFavorites');
        const quickSettingsButton = document.getElementById('quickSettings');
        const quickHelpButton = document.getElementById('quickHelp');

        // FAB button click
        if (fabButton) {
            fabButton.onclick = () => this.showQuickActionsModal();
        }

        // Close button
        if (closeButton) {
            closeButton.onclick = () => this.hideQuickActionsModal();
        }

        // Quick Search
        if (quickSearchButton) {
            quickSearchButton.onclick = () => {
                this.hideQuickActionsModal();
                this.showSearchModal();
                this.addSystemNotification(
                    'Quick Search',
                    'Search modal opened from quick actions'
                );
            };
        }

        // Quick Refresh
        if (quickRefreshButton) {
            quickRefreshButton.onclick = () => {
                this.hideQuickActionsModal();
                this.forceRefresh();
                this.addSystemNotification(
                    'Data Refreshed',
                    'Match data has been refreshed'
                );
            };
        }

        // Quick Favorites
        if (quickFavoritesButton) {
            quickFavoritesButton.onclick = () => {
                this.hideQuickActionsModal();
                this.showFavorites();
                this.addSystemNotification(
                    'Favorites',
                    'Viewing your saved matches'
                );
            };
        }

        // Quick Settings
        if (quickSettingsButton) {
            quickSettingsButton.onclick = () => {
                this.hideQuickActionsModal();
                this.showSettings();
                this.addSystemNotification(
                    'Settings',
                    'Settings panel opened'
                );
            };
        }

        // Quick Help
        if (quickHelpButton) {
            quickHelpButton.onclick = () => {
                this.hideQuickActionsModal();
                this.showHelp();
                this.addSystemNotification(
                    'Help & Support',
                    'Help section opened'
                );
            };
        }

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('quickActionsModal');
            if (modal && e.target === modal) {
                this.hideQuickActionsModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideQuickActionsModal();
            }
        });
    }

    // Quick action helper methods
    showFavorites() {
        const savedMatches = JSON.parse(localStorage.getItem('savedMatches') || '[]');
        if (savedMatches.length === 0) {
            this.showSuccess('No saved matches yet. Save some matches to see them here!');
        } else {
            this.showSuccess(`You have ${savedMatches.length} saved match${savedMatches.length !== 1 ? 'es' : ''}`);
            // TODO: Implement favorites view
        }
    }

    showSettings() {
        this.showSuccess('Settings panel coming soon!');
        // TODO: Implement settings panel
    }

    showHelp() {
        this.showSuccess('Help & Support coming soon!');
        // TODO: Implement help section
    }

    // Profile Modal Methods
    showProfileModal() {
        const modal = document.getElementById('profileModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.loadProfileData();
        }
    }

    hideProfileModal() {
        const modal = document.getElementById('profileModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    setupProfileModalHandlers() {
        const profileButton = document.getElementById('profileButton');
        const closeButton = document.getElementById('closeProfileModal');
        const manageApiKeyButton = document.getElementById('manageApiKey');
        const notificationsToggle = document.getElementById('notificationsToggle');
        const themeSelect = document.getElementById('themeSelect');
        const exportDataButton = document.getElementById('exportData');
        const importDataButton = document.getElementById('importData');
        const clearDataButton = document.getElementById('clearData');
        const helpButton = document.getElementById('helpButton');
        const feedbackButton = document.getElementById('feedbackButton');
        const aboutButton = document.getElementById('aboutButton');

        // Profile button click
        if (profileButton) {
            profileButton.onclick = () => this.showProfileModal();
        }

        // Close button
        if (closeButton) {
            closeButton.onclick = () => this.hideProfileModal();
        }

        // Manage API Key
        if (manageApiKeyButton) {
            manageApiKeyButton.onclick = () => {
                this.hideProfileModal();
                this.showApiKeyModal();
            };
        }

        // Notifications toggle
        if (notificationsToggle) {
            notificationsToggle.onchange = (e) => {
                this.notificationService.setNotificationsEnabled(e.target.checked);
                this.showSuccess(`Notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
            };
        }

        // Theme select
        if (themeSelect) {
            themeSelect.onchange = (e) => {
                this.setTheme(e.target.value);
                this.showSuccess(`Theme changed to ${e.target.value}`);
            };
        }

        // Export data
        if (exportDataButton) {
            exportDataButton.onclick = () => this.exportUserData();
        }

        // Import data
        if (importDataButton) {
            importDataButton.onclick = () => this.importUserData();
        }

        // Clear data
        if (clearDataButton) {
            clearDataButton.onclick = () => this.clearUserData();
        }

        // Help button
        if (helpButton) {
            helpButton.onclick = () => {
                this.hideProfileModal();
                this.showHelp();
            };
        }

        // Feedback button
        if (feedbackButton) {
            feedbackButton.onclick = () => {
                this.hideProfileModal();
                this.showFeedback();
            };
        }

        // About button
        if (aboutButton) {
            aboutButton.onclick = () => {
                this.hideProfileModal();
                this.showAbout();
            };
        }

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('profileModal');
            if (modal && e.target === modal) {
                this.hideProfileModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideProfileModal();
            }
        });
    }

    // Load profile data
    loadProfileData() {
        // Load user stats
        const savedMatches = JSON.parse(localStorage.getItem('savedMatches') || '[]');
        const savedMatchesCount = document.getElementById('savedMatchesCount');
        if (savedMatchesCount) {
            savedMatchesCount.textContent = savedMatches.length;
        }

        // Load predictions count (demo data)
        const predictionsCount = document.getElementById('predictionsCount');
        if (predictionsCount) {
            predictionsCount.textContent = this.matches.length;
        }

        // Load API key status
        const apiKey = localStorage.getItem('apiFootballKey');
        const apiKeyStatus = document.getElementById('apiKeyStatus');
        if (apiKeyStatus) {
            apiKeyStatus.textContent = apiKey ? 'Status: Configured' : 'Status: Not configured';
        }

        // Load notification settings
        const notificationsToggle = document.getElementById('notificationsToggle');
        if (notificationsToggle) {
            notificationsToggle.checked = this.notificationService.areNotificationsEnabled();
        }

        // Load theme setting
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            const currentTheme = localStorage.getItem('betHelperTheme') || 'light';
            themeSelect.value = currentTheme;
        }

        // Load user info
        this.loadUserInfo();
    }

    // Load user information
    loadUserInfo() {
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const memberSince = document.getElementById('memberSince');

        // Get user info from localStorage or use defaults
        const userInfo = JSON.parse(localStorage.getItem('betHelperUserInfo') || '{}');
        
        if (userName) {
            userName.textContent = userInfo.name || 'BetHelper User';
        }
        
        if (userEmail) {
            userEmail.textContent = userInfo.email || 'user@bethelper.com';
        }
        
        if (memberSince) {
            memberSince.textContent = userInfo.memberSince || new Date().getFullYear();
        }
    }

    // Set theme
    setTheme(theme) {
        localStorage.setItem('betHelperTheme', theme);
        
        // Apply theme (basic implementation)
        if (theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }

    // Export user data
    exportUserData() {
        const userData = {
            savedMatches: JSON.parse(localStorage.getItem('savedMatches') || '[]'),
            notifications: JSON.parse(localStorage.getItem('betHelperNotifications') || '[]'),
            userInfo: JSON.parse(localStorage.getItem('betHelperUserInfo') || '{}'),
            settings: {
                theme: localStorage.getItem('betHelperTheme') || 'light',
                notifications: this.notificationService.areNotificationsEnabled()
            },
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `bethelper-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('Data exported successfully!');
    }

    // Import user data
    importUserData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const userData = JSON.parse(event.target.result);
                        
                        // Import saved matches
                        if (userData.savedMatches) {
                            localStorage.setItem('savedMatches', JSON.stringify(userData.savedMatches));
                        }
                        
                        // Import notifications
                        if (userData.notifications) {
                            localStorage.setItem('betHelperNotifications', JSON.stringify(userData.notifications));
                        }
                        
                        // Import user info
                        if (userData.userInfo) {
                            localStorage.setItem('betHelperUserInfo', JSON.stringify(userData.userInfo));
                        }
                        
                        // Import settings
                        if (userData.settings) {
                            if (userData.settings.theme) {
                                localStorage.setItem('betHelperTheme', userData.settings.theme);
                            }
                            if (userData.settings.notifications !== undefined) {
                                this.notificationService.setNotificationsEnabled(userData.settings.notifications);
                            }
                        }
                        
                        this.showSuccess('Data imported successfully!');
                        this.loadProfileData(); // Refresh the profile data
                        
                    } catch (error) {
                        console.error('Error importing data:', error);
                        this.showError('Invalid data file. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    // Clear user data
    clearUserData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            // Clear all localStorage data
            localStorage.removeItem('savedMatches');
            localStorage.removeItem('betHelperNotifications');
            localStorage.removeItem('betHelperUserInfo');
            localStorage.removeItem('betHelperTheme');
            localStorage.removeItem('apiFootballKey');
            
            // Reset notification service
            this.notificationService.clearAllNotifications();
            
            this.showSuccess('All data cleared successfully!');
            this.loadProfileData(); // Refresh the profile data
            
            // Reload the app
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }

    // Show feedback
    showFeedback() {
        this.showSuccess('Feedback feature coming soon!');
        // TODO: Implement feedback system
    }

    // Show about
    showAbout() {
        this.showSuccess('About BetHelper v2.0 - Your smart football prediction app!');
        // TODO: Implement about modal
    }

    // Favorites Modal Methods
    showFavoritesModal() {
        const modal = document.getElementById('favoritesModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.loadFavorites();
        }
    }

    hideFavoritesModal() {
        const modal = document.getElementById('favoritesModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    setupFavoritesModalHandlers() {
        const favoritesButton = document.getElementById('favoritesButton');
        const closeButton = document.getElementById('closeFavoritesModal');
        const sortButton = document.getElementById('sortFavorites');
        const filterButtons = document.querySelectorAll('.favorites-filter-btn');
        const browseMatchesButton = document.getElementById('browseMatches');
        const exportFavoritesButton = document.getElementById('exportFavorites');
        const clearFavoritesButton = document.getElementById('clearFavorites');

        // Favorites button click
        if (favoritesButton) {
            favoritesButton.onclick = () => this.showFavoritesModal();
        }

        // Close button
        if (closeButton) {
            closeButton.onclick = () => this.hideFavoritesModal();
        }

        // Sort button
        if (sortButton) {
            sortButton.onclick = () => this.toggleFavoritesSort();
        }

        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => {
                    btn.classList.remove('active', 'bg-red-500', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                });
                button.classList.add('active', 'bg-red-500', 'text-white');
                button.classList.remove('bg-gray-200', 'text-gray-700');
                
                this.filterFavorites(button.textContent.trim());
            });
        });

        // Browse matches button
        if (browseMatchesButton) {
            browseMatchesButton.onclick = () => {
                this.hideFavoritesModal();
                this.showSuccess('Browse matches to save your favorites!');
            };
        }

        // Export favorites
        if (exportFavoritesButton) {
            exportFavoritesButton.onclick = () => this.exportFavorites();
        }

        // Clear favorites
        if (clearFavoritesButton) {
            clearFavoritesButton.onclick = () => this.clearFavorites();
        }

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('favoritesModal');
            if (modal && e.target === modal) {
                this.hideFavoritesModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideFavoritesModal();
            }
        });
    }

    // Load favorites
    loadFavorites() {
        this.showFavoritesLoading();
        
        setTimeout(() => {
            const savedMatches = JSON.parse(localStorage.getItem('savedMatches') || '[]');
            this.displayFavorites(savedMatches);
            this.updateFavoritesCount(savedMatches.length);
            this.updateFavoritesLastUpdated();
        }, 500);
    }

    // Display favorites
    displayFavorites(savedMatches) {
        const emptyState = document.getElementById('favoritesEmptyState');
        const favoritesList = document.getElementById('favoritesList');
        const loading = document.getElementById('favoritesLoading');

        if (loading) loading.classList.add('hidden');

        if (savedMatches.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (favoritesList) favoritesList.classList.add('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');
        if (favoritesList) {
            favoritesList.classList.remove('hidden');
            favoritesList.innerHTML = savedMatches.map(matchId => {
                const match = this.matches.find(m => m.fixture.id === matchId);
                if (match) {
                    return this.createFavoriteMatchCard(match);
                }
                return '';
            }).join('');
        }
    }

    // Create favorite match card
    createFavoriteMatchCard(match) {
        const prediction = this.generatePrediction(match);
        const confidenceColor = prediction.confidence >= 80 ? 'text-green-600' : 
                               prediction.confidence >= 60 ? 'text-yellow-600' : 'text-red-600';

        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3 flex-1 min-w-0">
                        <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy">
                        <span class="font-medium text-gray-900 truncate text-sm">${match.teams.home.name}</span>
                    </div>
                    <div class="text-center flex-shrink-0 mx-2">
                        <div class="text-sm text-gray-500">VS</div>
                        <div class="text-xs text-gray-400">${this.formatTime(match.fixture.date)}</div>
                    </div>
                    <div class="flex items-center space-x-3 flex-1 min-w-0 justify-end">
                        <span class="font-medium text-gray-900 truncate text-sm">${match.teams.away.name}</span>
                        <img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy">
                    </div>
                </div>
                
                <div class="flex space-x-2 mb-3">
                    <div class="flex-1 bg-gray-100 rounded p-2 text-center">
                        <div class="text-lg font-bold text-gray-900">${prediction.homeWin}%</div>
                        <div class="text-xs text-gray-500">Home</div>
                    </div>
                    <div class="flex-1 bg-gray-100 rounded p-2 text-center">
                        <div class="text-lg font-bold text-gray-900">${prediction.draw}%</div>
                        <div class="text-xs text-gray-500">Draw</div>
                    </div>
                    <div class="flex-1 bg-gray-100 rounded p-2 text-center">
                        <div class="text-lg font-bold text-gray-900">${prediction.awayWin}%</div>
                        <div class="text-xs text-gray-500">Away</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-medium ${confidenceColor}">${prediction.confidence}% confidence</span>
                        <span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            ${prediction.recommendation}
                        </span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="app.placeBet(${match.fixture.id})" class="text-sm text-green-500 hover:text-green-600 transition-colors">
                            <i class="ri-money-dollar-circle-line mr-1"></i>Bet
                        </button>
                        <button onclick="app.removeFromFavorites(${match.fixture.id})" class="text-sm text-red-500 hover:text-red-600 transition-colors">
                            <i class="ri-heart-fill mr-1"></i>Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Update favorites count
    updateFavoritesCount(count) {
        const countElement = document.getElementById('favoritesCount');
        if (countElement) {
            countElement.textContent = `${count} saved match${count !== 1 ? 'es' : ''}`;
        }
    }

    // Update last updated time
    updateFavoritesLastUpdated() {
        const lastUpdatedElement = document.getElementById('favoritesLastUpdated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = 'Just now';
        }
    }

    // Show favorites loading
    showFavoritesLoading() {
        const emptyState = document.getElementById('favoritesEmptyState');
        const favoritesList = document.getElementById('favoritesList');
        const loading = document.getElementById('favoritesLoading');

        if (emptyState) emptyState.classList.add('hidden');
        if (favoritesList) favoritesList.classList.add('hidden');
        if (loading) loading.classList.remove('hidden');
    }

    // Toggle favorites sort
    toggleFavoritesSort() {
        this.showSuccess('Sort options coming soon!');
        // TODO: Implement sorting functionality
    }

    // Filter favorites
    filterFavorites(filter) {
        this.showSuccess(`Filtered by: ${filter}`);
        // TODO: Implement filtering functionality
    }

    // Remove from favorites
    removeFromFavorites(matchId) {
        const savedMatches = JSON.parse(localStorage.getItem('savedMatches') || '[]');
        const updatedMatches = savedMatches.filter(id => id !== matchId);
        localStorage.setItem('savedMatches', JSON.stringify(updatedMatches));
        
        this.showSuccess('Match removed from favorites');
        this.loadFavorites(); // Refresh the list
    }

    // Export favorites
    exportFavorites() {
        const savedMatches = JSON.parse(localStorage.getItem('savedMatches') || '[]');
        const favoritesData = {
            matches: savedMatches,
            exportDate: new Date().toISOString(),
            totalCount: savedMatches.length
        };

        const dataStr = JSON.stringify(favoritesData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `bethelper-favorites-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('Favorites exported successfully!');
    }

    // Clear favorites
    clearFavorites() {
        if (confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
            localStorage.removeItem('savedMatches');
            this.showSuccess('All favorites cleared');
            this.loadFavorites(); // Refresh the list
        }
    }

    // Override the existing showFavorites method
    showFavorites() {
        this.showFavoritesModal();
    }

    // Schedule Modal Methods
    showScheduleModal() {
        const modal = document.getElementById('scheduleModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.loadSchedule();
        }
    }

    hideScheduleModal() {
        const modal = document.getElementById('scheduleModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    setupScheduleModalHandlers() {
        const scheduleButton = document.getElementById('scheduleButton');
        const closeButton = document.getElementById('closeScheduleModal');
        const refreshButton = document.getElementById('refreshSchedule');
        const prevWeekButton = document.getElementById('prevWeek');
        const nextWeekButton = document.getElementById('nextWeek');
        const todayButton = document.getElementById('todayButton');
        const filterButtons = document.querySelectorAll('.schedule-filter-btn');
        const loadMoreButton = document.getElementById('loadMoreSchedule');
        const exportScheduleButton = document.getElementById('exportSchedule');
        const addToCalendarButton = document.getElementById('addToCalendar');

        // Schedule button click
        if (scheduleButton) {
            scheduleButton.onclick = () => this.showScheduleModal();
        }

        // Close button
        if (closeButton) {
            closeButton.onclick = () => this.hideScheduleModal();
        }

        // Refresh button
        if (refreshButton) {
            refreshButton.onclick = () => {
                this.refreshSchedule();
                this.showSuccess('Schedule refreshed');
            };
        }

        // Date navigation
        if (prevWeekButton) {
            prevWeekButton.onclick = () => this.navigateScheduleWeek(-1);
        }

        if (nextWeekButton) {
            nextWeekButton.onclick = () => this.navigateScheduleWeek(1);
        }

        if (todayButton) {
            todayButton.onclick = () => this.goToToday();
        }

        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => {
                    btn.classList.remove('active', 'bg-blue-500', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                });
                button.classList.add('active', 'bg-blue-500', 'text-white');
                button.classList.remove('bg-gray-200', 'text-gray-700');
                
                this.filterSchedule(button.textContent.trim());
            });
        });

        // Load more button
        if (loadMoreButton) {
            loadMoreButton.onclick = () => this.loadMoreScheduleDays();
        }

        // Export schedule
        if (exportScheduleButton) {
            exportScheduleButton.onclick = () => this.exportSchedule();
        }

        // Add to calendar
        if (addToCalendarButton) {
            addToCalendarButton.onclick = () => this.addScheduleToCalendar();
        }

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('scheduleModal');
            if (modal && e.target === modal) {
                this.hideScheduleModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideScheduleModal();
            }
        });
    }

    // Load schedule
    loadSchedule() {
        this.showScheduleLoading();
        this.currentScheduleWeek = 0; // 0 = current week, -1 = previous week, 1 = next week
        
        setTimeout(() => {
            this.displaySchedule();
            this.updateScheduleCount();
            this.updateScheduleLastUpdated();
            this.updateWeekRange();
        }, 500);
    }

    // Display schedule
    displaySchedule() {
        const emptyState = document.getElementById('scheduleEmptyState');
        const scheduleList = document.getElementById('scheduleList');
        const loading = document.getElementById('scheduleLoading');

        if (loading) loading.classList.add('hidden');

        if (this.matches.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (scheduleList) scheduleList.classList.add('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');
        if (scheduleList) {
            scheduleList.classList.remove('hidden');
            scheduleList.innerHTML = this.createScheduleItems();
        }
    }

    // Create schedule items
    createScheduleItems() {
        // Group matches by date
        const matchesByDate = this.groupMatchesByDate(this.matches);
        
        return Object.keys(matchesByDate).map(date => {
            const matches = matchesByDate[date];
            return this.createScheduleDateSection(date, matches);
        }).join('');
    }

    // Group matches by date
    groupMatchesByDate(matches) {
        const grouped = {};
        matches.forEach(match => {
            const date = this.formatDate(match.fixture.date);
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(match);
        });
        return grouped;
    }

    // Create schedule date section
    createScheduleDateSection(date, matches) {
        return `
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                    <h5 class="font-semibold text-gray-900">${date}</h5>
                    <span class="text-sm text-gray-500">${matches.length} match${matches.length !== 1 ? 'es' : ''}</span>
                </div>
                <div class="space-y-3">
                    ${matches.map(match => this.createScheduleMatchCard(match)).join('')}
                </div>
            </div>
        `;
    }

    // Create schedule match card
    createScheduleMatchCard(match) {
        const prediction = this.generatePrediction(match);
        const confidenceColor = prediction.confidence >= 80 ? 'text-green-600' : 
                               prediction.confidence >= 60 ? 'text-yellow-600' : 'text-red-600';

        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer" onclick="app.showMatchDetailsModal(${match.fixture.id})">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3 flex-1 min-w-0">
                        <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy">
                        <span class="font-medium text-gray-900 truncate text-sm">${match.teams.home.name}</span>
                    </div>
                    <div class="text-center flex-shrink-0 mx-2">
                        <div class="text-sm text-gray-500">VS</div>
                        <div class="text-xs text-gray-400">${this.formatTime(match.fixture.date)}</div>
                    </div>
                    <div class="flex items-center space-x-3 flex-1 min-w-0 justify-end">
                        <span class="font-medium text-gray-900 truncate text-sm">${match.teams.away.name}</span>
                        <img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy">
                    </div>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-medium ${confidenceColor}">${prediction.confidence}% confidence</span>
                        <span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            ${prediction.recommendation}
                        </span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="event.stopPropagation(); app.saveMatch(${match.fixture.id})" class="text-sm text-red-500 hover:text-red-600 transition-colors">
                            <i class="ri-heart-line mr-1"></i>Save
                        </button>
                        <button onclick="event.stopPropagation(); app.placeBet(${match.fixture.id})" class="text-sm text-green-500 hover:text-green-600 transition-colors">
                            <i class="ri-money-dollar-circle-line mr-1"></i>Bet
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Update schedule count
    updateScheduleCount() {
        const countElement = document.getElementById('scheduleCount');
        if (countElement) {
            countElement.textContent = `${this.matches.length} match${this.matches.length !== 1 ? 'es' : ''} scheduled`;
        }
    }

    // Update last updated time
    updateScheduleLastUpdated() {
        const lastUpdatedElement = document.getElementById('scheduleLastUpdated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = 'Just now';
        }
    }

    // Update week range
    updateWeekRange() {
        const weekRangeElement = document.getElementById('currentWeekRange');
        if (weekRangeElement) {
            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            weekRangeElement.textContent = `${this.formatDate(weekStart.toISOString())} - ${this.formatDate(weekEnd.toISOString())}`;
        }
    }

    // Show schedule loading
    showScheduleLoading() {
        const emptyState = document.getElementById('scheduleEmptyState');
        const scheduleList = document.getElementById('scheduleList');
        const loading = document.getElementById('scheduleLoading');

        if (emptyState) emptyState.classList.add('hidden');
        if (scheduleList) scheduleList.classList.add('hidden');
        if (loading) loading.classList.remove('hidden');
    }

    // Refresh schedule
    refreshSchedule() {
        this.loadSchedule();
    }

    // Navigate schedule week
    navigateScheduleWeek(direction) {
        this.currentScheduleWeek += direction;
        this.showSuccess(`Navigated to ${direction > 0 ? 'next' : 'previous'} week`);
        // TODO: Implement actual week navigation with API calls
    }

    // Go to today
    goToToday() {
        this.currentScheduleWeek = 0;
        this.showSuccess('Returned to current week');
        this.updateWeekRange();
    }

    // Filter schedule
    filterSchedule(filter) {
        this.showSuccess(`Filtered by: ${filter}`);
        // TODO: Implement actual filtering functionality
    }

    // Load more schedule days
    loadMoreScheduleDays() {
        this.showSuccess('Loading more days...');
        // TODO: Implement loading more days functionality
    }

    // Export schedule
    exportSchedule() {
        const scheduleData = {
            matches: this.matches,
            exportDate: new Date().toISOString(),
            totalCount: this.matches.length,
            weekRange: document.getElementById('currentWeekRange')?.textContent || 'This Week'
        };

        const dataStr = JSON.stringify(scheduleData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `bethelper-schedule-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('Schedule exported successfully!');
    }

    // Add schedule to calendar
    addScheduleToCalendar() {
        this.showSuccess('Calendar integration coming soon!');
        // TODO: Implement calendar integration
    }

    // Home Modal Methods
    showHomeModal() {
        const modal = document.getElementById('homeModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.loadHomeDashboard();
        }
    }

    hideHomeModal() {
        const modal = document.getElementById('homeModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    setupHomeModalHandlers() {
        const homeButton = document.getElementById('homeButton');
        const closeButton = document.getElementById('closeHomeModal');
        const refreshButton = document.getElementById('refreshHome');
        const viewAllMatchesButton = document.getElementById('viewAllMatches');
        const viewAllActivityButton = document.getElementById('viewAllActivity');
        const getNewTipButton = document.getElementById('getNewTip');
        const getStartedButton = document.getElementById('getStarted');
        const exportDashboardButton = document.getElementById('exportDashboard');
        const shareDashboardButton = document.getElementById('shareDashboard');

        // Quick action buttons
        const homeSearchButton = document.getElementById('homeSearch');
        const homeScheduleButton = document.getElementById('homeSchedule');
        const homeFavoritesButton = document.getElementById('homeFavorites');
        const homeNotificationsButton = document.getElementById('homeNotifications');
        const homeSettingsButton = document.getElementById('homeSettings');
        const homeHelpButton = document.getElementById('homeHelp');

        // Home button click
        if (homeButton) {
            homeButton.onclick = () => this.showHomeModal();
        }

        // Close button
        if (closeButton) {
            closeButton.onclick = () => this.hideHomeModal();
        }

        // Refresh button
        if (refreshButton) {
            refreshButton.onclick = () => {
                this.refreshHomeDashboard();
                this.showSuccess('Dashboard refreshed');
            };
        }

        // View all matches
        if (viewAllMatchesButton) {
            viewAllMatchesButton.onclick = () => {
                this.hideHomeModal();
                this.showScheduleModal();
            };
        }

        // View all activity
        if (viewAllActivityButton) {
            viewAllActivityButton.onclick = () => {
                this.showSuccess('Activity log coming soon!');
            };
        }

        // Get new tip
        if (getNewTipButton) {
            getNewTipButton.onclick = () => this.getNewDailyTip();
        }

        // Get started
        if (getStartedButton) {
            getStartedButton.onclick = () => {
                this.hideHomeModal();
                this.showScheduleModal();
            };
        }

        // Export dashboard
        if (exportDashboardButton) {
            exportDashboardButton.onclick = () => this.exportDashboard();
        }

        // Share dashboard
        if (shareDashboardButton) {
            shareDashboardButton.onclick = () => this.shareDashboard();
        }

        // Quick action buttons
        if (homeSearchButton) {
            homeSearchButton.onclick = () => {
                this.hideHomeModal();
                this.showSearchModal();
            };
        }

        if (homeScheduleButton) {
            homeScheduleButton.onclick = () => {
                this.hideHomeModal();
                this.showScheduleModal();
            };
        }

        if (homeFavoritesButton) {
            homeFavoritesButton.onclick = () => {
                this.hideHomeModal();
                this.showFavoritesModal();
            };
        }

        if (homeNotificationsButton) {
            homeNotificationsButton.onclick = () => {
                this.hideHomeModal();
                this.showNotificationModal();
            };
        }

        if (homeSettingsButton) {
            homeSettingsButton.onclick = () => {
                this.hideHomeModal();
                this.showProfileModal();
            };
        }

        if (homeHelpButton) {
            homeHelpButton.onclick = () => {
                this.showSuccess('Help & Support coming soon!');
            };
        }

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('homeModal');
            if (modal && e.target === modal) {
                this.hideHomeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideHomeModal();
            }
        });
    }

    // Load home dashboard
    loadHomeDashboard() {
        this.showHomeLoading();
        
        setTimeout(() => {
            this.updateHomeStats();
            this.loadFeaturedMatches();
            this.loadRecentActivity();
            this.updateHomeWelcome();
            this.updateHomeLastUpdated();
            this.hideHomeLoading();
        }, 500);
    }

    // Update home stats
    updateHomeStats() {
        const matchesCount = document.getElementById('homeMatchesCount');
        const predictionsCount = document.getElementById('homePredictionsCount');
        const favoritesCount = document.getElementById('homeFavoritesCount');
        const accuracyElement = document.getElementById('homeAccuracy');

        if (matchesCount) {
            matchesCount.textContent = this.matches.length;
        }

        if (predictionsCount) {
            predictionsCount.textContent = this.matches.length;
        }

        if (favoritesCount) {
            const savedMatches = JSON.parse(localStorage.getItem('savedMatches') || '[]');
            favoritesCount.textContent = savedMatches.length;
        }

        if (accuracyElement) {
            // Calculate mock accuracy based on predictions
            const accuracy = Math.round(65 + Math.random() * 25); // 65-90%
            accuracyElement.textContent = `${accuracy}%`;
        }
    }

    // Load featured matches
    loadFeaturedMatches() {
        const featuredContainer = document.getElementById('featuredMatches');
        if (!featuredContainer) return;

        if (this.matches.length === 0) {
            featuredContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="ri-calendar-line text-3xl mb-2"></i>
                    <p>No matches available</p>
                </div>
            `;
            return;
        }

        const featuredMatches = this.matches.slice(0, 3); // Show first 3 matches
        featuredContainer.innerHTML = featuredMatches.map(match => this.createFeaturedMatchCard(match)).join('');
    }

    // Create featured match card
    createFeaturedMatchCard(match) {
        const prediction = this.generatePrediction(match);
        const confidenceColor = prediction.confidence >= 80 ? 'text-green-600' : 
                               prediction.confidence >= 60 ? 'text-yellow-600' : 'text-red-600';

        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer" onclick="app.showMatchDetailsModal(${match.fixture.id})">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3 flex-1 min-w-0">
                        <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy">
                        <span class="font-medium text-gray-900 truncate text-sm">${match.teams.home.name}</span>
                    </div>
                    <div class="text-center flex-shrink-0 mx-2">
                        <div class="text-sm text-gray-500">VS</div>
                        <div class="text-xs text-gray-400">${this.formatTime(match.fixture.date)}</div>
                    </div>
                    <div class="flex items-center space-x-3 flex-1 min-w-0 justify-end">
                        <span class="font-medium text-gray-900 truncate text-sm">${match.teams.away.name}</span>
                        <img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy">
                    </div>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-medium ${confidenceColor}">${prediction.confidence}% confidence</span>
                        <span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            ${prediction.recommendation}
                        </span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="event.stopPropagation(); app.saveMatch(${match.fixture.id})" class="text-sm text-red-500 hover:text-red-600 transition-colors">
                            <i class="ri-heart-line mr-1"></i>Save
                        </button>
                        <button onclick="event.stopPropagation(); app.placeBet(${match.fixture.id})" class="text-sm text-green-500 hover:text-green-600 transition-colors">
                            <i class="ri-money-dollar-circle-line mr-1"></i>Bet
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Load recent activity
    loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;

        const activities = [
            { type: 'prediction', text: 'Made prediction for Manchester City vs Liverpool', time: '2 hours ago', icon: 'ri-target-line', color: 'text-green-600' },
            { type: 'favorite', text: 'Saved Arsenal vs Chelsea to favorites', time: '4 hours ago', icon: 'ri-heart-line', color: 'text-red-600' },
            { type: 'bet', text: 'Placed bet on Barcelona vs Real Madrid', time: '6 hours ago', icon: 'ri-money-dollar-circle-line', color: 'text-blue-600' },
            { type: 'notification', text: 'Received match result notification', time: '1 day ago', icon: 'ri-notification-line', color: 'text-yellow-600' }
        ];

        activityContainer.innerHTML = activities.map(activity => `
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <i class="${activity.icon} ${activity.color} text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm text-gray-900">${activity.text}</p>
                    <p class="text-xs text-gray-500">${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    // Update home welcome message
    updateHomeWelcome() {
        const welcomeElement = document.getElementById('homeWelcome');
        if (welcomeElement) {
            const hour = new Date().getHours();
            let greeting = 'Good morning';
            if (hour >= 12 && hour < 17) {
                greeting = 'Good afternoon';
            } else if (hour >= 17) {
                greeting = 'Good evening';
            }
            welcomeElement.textContent = `${greeting}! Here's your overview`;
        }
    }

    // Update home last updated
    updateHomeLastUpdated() {
        const lastUpdatedElement = document.getElementById('homeLastUpdated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = 'Just now';
        }
    }

    // Show home loading
    showHomeLoading() {
        const emptyState = document.getElementById('homeEmptyState');
        const loading = document.getElementById('homeLoading');

        if (emptyState) emptyState.classList.add('hidden');
        if (loading) loading.classList.remove('hidden');
    }

    // Hide home loading
    hideHomeLoading() {
        const loading = document.getElementById('homeLoading');
        if (loading) loading.classList.add('hidden');
    }

    // Refresh home dashboard
    refreshHomeDashboard() {
        this.loadHomeDashboard();
    }

    // Get new daily tip
    getNewDailyTip() {
        const tips = [
            'Always check team form and recent performance before betting.',
            'Consider head-to-head statistics between teams.',
            'Look at home/away performance differences.',
            'Check for key player injuries or suspensions.',
            'Monitor weather conditions for outdoor matches.',
            'Consider the importance of the match to both teams.',
            'Look at goal-scoring patterns and defensive records.',
            'Check if teams are in good form or struggling.',
            'Consider the time of season and fixture congestion.',
            'Always bet responsibly and within your budget.'
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        const tipElement = document.getElementById('dailyTip');
        if (tipElement) {
            tipElement.textContent = randomTip;
        }
        this.showSuccess('New tip loaded!');
    }

    // Export dashboard
    exportDashboard() {
        const dashboardData = {
            stats: {
                matchesCount: this.matches.length,
                predictionsCount: this.matches.length,
                favoritesCount: JSON.parse(localStorage.getItem('savedMatches') || '[]').length,
                accuracy: Math.round(65 + Math.random() * 25)
            },
            featuredMatches: this.matches.slice(0, 3),
            exportDate: new Date().toISOString(),
            user: 'BetHelper User'
        };

        const dataStr = JSON.stringify(dashboardData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `bethelper-dashboard-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('Dashboard exported successfully!');
    }

    // Share dashboard
    shareDashboard() {
        if (navigator.share) {
            navigator.share({
                title: 'BetHelper Dashboard',
                text: 'Check out my BetHelper dashboard with predictions and insights!',
                url: window.location.href
            }).then(() => {
                this.showSuccess('Dashboard shared successfully!');
            }).catch(() => {
                this.showSuccess('Sharing cancelled');
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showSuccess('Dashboard link copied to clipboard!');
            }).catch(() => {
                this.showSuccess('Sharing not supported on this device');
            });
        }
    }

    // Match Details Modal Methods
    showMatchDetailsModal(matchId) {
        const modal = document.getElementById('matchDetailsModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.loadMatchDetails(matchId);
        }
    }

    hideMatchDetailsModal() {
        const modal = document.getElementById('matchDetailsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    setupMatchDetailsModalHandlers() {
        const closeButton = document.getElementById('closeMatchDetailsModal');
        const refreshButton = document.getElementById('refreshMatchDetails');
        const saveButton = document.getElementById('saveMatchDetails');
        const betButton = document.getElementById('placeBetDetails');
        const exportButton = document.getElementById('exportMatchDetails');
        const shareButton = document.getElementById('shareMatchDetails');

        // Close button
        if (closeButton) {
            closeButton.onclick = () => this.hideMatchDetailsModal();
        }

        // Refresh button
        if (refreshButton) {
            refreshButton.onclick = () => {
                this.refreshMatchDetails();
                this.showSuccess('Match details refreshed');
            };
        }

        // Save match
        if (saveButton) {
            saveButton.onclick = () => {
                if (this.currentMatchDetails) {
                    this.saveMatch(this.currentMatchDetails.fixture.id);
                }
            };
        }

        // Place bet
        if (betButton) {
            betButton.onclick = () => {
                if (this.currentMatchDetails) {
                    this.placeBet(this.currentMatchDetails.fixture.id);
                }
            };
        }

        // Export match details
        if (exportButton) {
            exportButton.onclick = () => this.exportMatchDetails();
        }

        // Share match details
        if (shareButton) {
            shareButton.onclick = () => this.shareMatchDetails();
        }

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('matchDetailsModal');
            if (modal && e.target === modal) {
                this.hideMatchDetailsModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideMatchDetailsModal();
            }
        });
    }

    // Load match details
    loadMatchDetails(matchId) {
        this.showMatchDetailsLoading();
        
        // Find the match
        const match = this.matches.find(m => m.fixture.id === matchId);
        if (!match) {
            this.showError('Match not found');
            this.hideMatchDetailsModal();
            return;
        }

        this.currentMatchDetails = match;
        
        setTimeout(() => {
            this.updateMatchDetailsHeader(match);
            this.updatePredictionOverview(match);
            this.updateTeamStatistics(match);
            this.loadHeadToHeadHistory(match);
            this.loadRecentForm(match);
            this.loadDetailedAnalysis(match);
            this.updateMatchDetailsLastUpdated();
            this.hideMatchDetailsLoading();
        }, 500);
    }

    // Update match details header
    updateMatchDetailsHeader(match) {
        const title = document.getElementById('matchDetailsTitle');
        const subtitle = document.getElementById('matchDetailsSubtitle');
        const homeTeamLogo = document.getElementById('homeTeamLogo');
        const homeTeamName = document.getElementById('homeTeamName');
        const awayTeamLogo = document.getElementById('awayTeamLogo');
        const awayTeamName = document.getElementById('awayTeamName');
        const matchTime = document.getElementById('matchTime');
        const matchDate = document.getElementById('matchDate');

        if (title) {
            title.textContent = `${match.teams.home.name} vs ${match.teams.away.name}`;
        }

        if (subtitle) {
            subtitle.textContent = `${match.league.name} - ${match.league.round}`;
        }

        if (homeTeamLogo) {
            homeTeamLogo.src = match.teams.home.logo;
            homeTeamLogo.alt = match.teams.home.name;
        }

        if (homeTeamName) {
            homeTeamName.textContent = match.teams.home.name;
        }

        if (awayTeamLogo) {
            awayTeamLogo.src = match.teams.away.logo;
            awayTeamLogo.alt = match.teams.away.name;
        }

        if (awayTeamName) {
            awayTeamName.textContent = match.teams.away.name;
        }

        if (matchTime) {
            matchTime.textContent = this.formatTime(match.fixture.date);
        }

        if (matchDate) {
            matchDate.textContent = this.formatDate(match.fixture.date);
        }
    }

    // Update prediction overview
    updatePredictionOverview(match) {
        const prediction = this.generatePrediction(match);
        
        const homeWinPercent = document.getElementById('homeWinPercent');
        const drawPercent = document.getElementById('drawPercent');
        const awayWinPercent = document.getElementById('awayWinPercent');
        const recommendedBet = document.getElementById('recommendedBet');
        const confidenceLevel = document.getElementById('confidenceLevel');

        if (homeWinPercent) {
            homeWinPercent.textContent = `${prediction.homeWin}%`;
        }

        if (drawPercent) {
            drawPercent.textContent = `${prediction.draw}%`;
        }

        if (awayWinPercent) {
            awayWinPercent.textContent = `${prediction.awayWin}%`;
        }

        if (recommendedBet) {
            recommendedBet.textContent = prediction.recommendation;
        }

        if (confidenceLevel) {
            confidenceLevel.textContent = `${prediction.confidence}%`;
        }
    }

    // Update team statistics
    updateTeamStatistics(match) {
        const homeStats = this.generateTeamStats(match.teams.home.id);
        const awayStats = this.generateTeamStats(match.teams.away.id);

        // Home team stats
        document.getElementById('homeTeamStatsTitle').textContent = `${match.teams.home.name} Stats`;
        document.getElementById('homeForm').textContent = homeStats.form;
        document.getElementById('homeGoalsScored').textContent = homeStats.goalsScored;
        document.getElementById('homeGoalsConceded').textContent = homeStats.goalsConceded;
        document.getElementById('homeCleanSheets').textContent = homeStats.cleanSheets;
        document.getElementById('homeWinRate').textContent = homeStats.winRate;

        // Away team stats
        document.getElementById('awayTeamStatsTitle').textContent = `${match.teams.away.name} Stats`;
        document.getElementById('awayForm').textContent = awayStats.form;
        document.getElementById('awayGoalsScored').textContent = awayStats.goalsScored;
        document.getElementById('awayGoalsConceded').textContent = awayStats.goalsConceded;
        document.getElementById('awayCleanSheets').textContent = awayStats.cleanSheets;
        document.getElementById('awayWinRate').textContent = awayStats.winRate;
    }

    // Generate team statistics
    generateTeamStats(teamId) {
        // Mock data generation based on team ID
        const seed = teamId.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        const random = (min, max) => Math.floor((seed * Math.random()) % (max - min + 1)) + min;

        const formResults = ['W', 'D', 'L'];
        const form = Array.from({length: 5}, () => formResults[random(0, 2)]).join('');

        return {
            form: form,
            goalsScored: random(15, 45),
            goalsConceded: random(10, 35),
            cleanSheets: random(3, 12),
            winRate: `${random(40, 75)}%`
        };
    }

    // Load head-to-head history
    loadHeadToHeadHistory(match) {
        const container = document.getElementById('headToHeadHistory');
        if (!container) return;

        const h2hMatches = this.generateHeadToHeadHistory(match);
        
        container.innerHTML = h2hMatches.map(h2h => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-3 flex-1">
                        <span class="font-medium text-gray-900 text-sm">${h2h.homeTeam}</span>
                    </div>
                    <div class="text-center flex-shrink-0 mx-2">
                        <div class="text-sm font-bold text-gray-900">${h2h.homeScore} - ${h2h.awayScore}</div>
                        <div class="text-xs text-gray-500">${h2h.date}</div>
                    </div>
                    <div class="flex items-center space-x-3 flex-1 justify-end">
                        <span class="font-medium text-gray-900 text-sm">${h2h.awayTeam}</span>
                    </div>
                </div>
                <div class="text-xs text-gray-500">${h2h.competition}</div>
            </div>
        `).join('');
    }

    // Generate head-to-head history
    generateHeadToHeadHistory(match) {
        const homeTeam = match.teams.home.name;
        const awayTeam = match.teams.away.name;
        
        const h2hMatches = [
            {
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                homeScore: 2,
                awayScore: 1,
                date: '2024-01-15',
                competition: 'Premier League'
            },
            {
                homeTeam: awayTeam,
                awayTeam: homeTeam,
                homeScore: 0,
                awayScore: 2,
                date: '2023-08-20',
                competition: 'Premier League'
            },
            {
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                homeScore: 1,
                awayScore: 1,
                date: '2023-03-10',
                competition: 'Premier League'
            },
            {
                homeTeam: awayTeam,
                awayTeam: homeTeam,
                homeScore: 1,
                awayScore: 3,
                date: '2022-12-05',
                competition: 'Premier League'
            }
        ];

        return h2hMatches;
    }

    // Load recent form
    loadRecentForm(match) {
        const homeContainer = document.getElementById('homeRecentForm');
        const awayContainer = document.getElementById('awayRecentForm');
        
        if (homeContainer) {
            homeContainer.innerHTML = this.generateRecentForm(match.teams.home.name, 'home');
        }
        
        if (awayContainer) {
            awayContainer.innerHTML = this.generateRecentForm(match.teams.away.name, 'away');
        }
    }

    // Generate recent form
    generateRecentForm(teamName, type) {
        const matches = [
            { opponent: 'Arsenal', result: 'W', score: '2-1', date: '2024-01-10' },
            { opponent: 'Chelsea', result: 'D', score: '1-1', date: '2024-01-07' },
            { opponent: 'Liverpool', result: 'L', score: '0-2', date: '2024-01-03' },
            { opponent: 'Tottenham', result: 'W', score: '3-1', date: '2023-12-30' },
            { opponent: 'Manchester United', result: 'W', score: '2-0', date: '2023-12-27' }
        ];

        return matches.map(match => {
            const resultColor = match.result === 'W' ? 'text-green-600' : 
                               match.result === 'D' ? 'text-yellow-600' : 'text-red-600';
            
            return `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div class="flex items-center space-x-2">
                        <span class="font-bold ${resultColor}">${match.result}</span>
                        <span class="text-sm text-gray-900">vs ${match.opponent}</span>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-medium text-gray-900">${match.score}</div>
                        <div class="text-xs text-gray-500">${match.date}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Load detailed analysis
    loadDetailedAnalysis(match) {
        const container = document.getElementById('detailedAnalysis');
        if (!container) return;

        const analysis = this.generateDetailedAnalysis(match);
        
        container.innerHTML = analysis.map(point => `
            <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-sm text-gray-700">${point}</p>
            </div>
        `).join('');
    }

    // Generate detailed analysis
    generateDetailedAnalysis(match) {
        const homeTeam = match.teams.home.name;
        const awayTeam = match.teams.away.name;
        
        return [
            `${homeTeam} has won 4 of their last 5 home matches, showing strong home form.`,
            `${awayTeam} has struggled on the road, losing 3 of their last 5 away games.`,
            `Head-to-head record favors ${homeTeam} with 3 wins in the last 5 meetings.`,
            `${homeTeam} has scored an average of 2.1 goals per game at home this season.`,
            `${awayTeam} has conceded an average of 1.8 goals per game on the road.`,
            `Both teams have key players available for this fixture.`,
            `Weather conditions are favorable for an attacking game.`,
            `Historical data suggests this will be a closely contested match.`
        ];
    }

    // Show match details loading
    showMatchDetailsLoading() {
        const loading = document.getElementById('matchDetailsLoading');
        if (loading) loading.classList.remove('hidden');
    }

    // Hide match details loading
    hideMatchDetailsLoading() {
        const loading = document.getElementById('matchDetailsLoading');
        if (loading) loading.classList.add('hidden');
    }

    // Refresh match details
    refreshMatchDetails() {
        if (this.currentMatchDetails) {
            this.loadMatchDetails(this.currentMatchDetails.fixture.id);
        }
    }

    // Update match details last updated
    updateMatchDetailsLastUpdated() {
        const lastUpdatedElement = document.getElementById('matchDetailsLastUpdated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = 'Just now';
        }
    }

    // Export match details
    exportMatchDetails() {
        if (!this.currentMatchDetails) return;

        const matchData = {
            match: this.currentMatchDetails,
            prediction: this.generatePrediction(this.currentMatchDetails),
            analysis: this.generateDetailedAnalysis(this.currentMatchDetails),
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(matchData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `match-details-${this.currentMatchDetails.fixture.id}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('Match details exported successfully!');
    }

    // Share match details
    shareMatchDetails() {
        if (!this.currentMatchDetails) return;

        const match = this.currentMatchDetails;
        const prediction = this.generatePrediction(match);
        
        const shareText = `Check out this match prediction: ${match.teams.home.name} vs ${match.teams.away.name} - ${prediction.recommendation} (${prediction.confidence}% confidence)`;

        if (navigator.share) {
            navigator.share({
                title: 'Match Prediction',
                text: shareText,
                url: window.location.href
            }).then(() => {
                this.showSuccess('Match details shared successfully!');
            }).catch(() => {
                this.showSuccess('Sharing cancelled');
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                this.showSuccess('Match details copied to clipboard!');
            }).catch(() => {
                this.showSuccess('Sharing not supported on this device');
            });
        }
    }

    // Override existing methods to add click handlers
    createMatchCard(match) {
        const prediction = this.generatePrediction(match);
        const confidenceColor = prediction.confidence >= 80 ? 'text-green-600' : 
                               prediction.confidence >= 60 ? 'text-yellow-600' : 'text-red-600';

        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer" onclick="app.showMatchDetailsModal(${match.fixture.id})">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3 flex-1 min-w-0">
                        <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy">
                        <span class="font-semibold text-gray-900 truncate text-sm sm:text-base">${match.teams.home.name}</span>
                    </div>
                    <div class="text-center flex-shrink-0 mx-2">
                        <div class="text-sm text-gray-500">VS</div>
                        <div class="text-xs text-gray-400">${this.formatTime(match.fixture.date)}</div>
                    </div>
                    <div class="flex items-center space-x-3 flex-1 min-w-0 justify-end">
                        <span class="font-semibold text-gray-900 truncate text-sm sm:text-base">${match.teams.away.name}</span>
                        <img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy">
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-2 mb-3">
                    <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">${prediction.homeWin}%</div>
                        <div class="text-xs text-gray-500">Home</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">${prediction.draw}%</div>
                        <div class="text-xs text-gray-500">Draw</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">${prediction.awayWin}%</div>
                        <div class="text-xs text-gray-500">Away</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-medium ${confidenceColor}">${prediction.confidence}% confidence</span>
                        <span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            ${prediction.recommendation}
                        </span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="event.stopPropagation(); app.saveMatch(${match.fixture.id})" class="text-sm text-red-500 hover:text-red-600 transition-colors">
                            <i class="ri-heart-line mr-1"></i>Save
                        </button>
                        <button onclick="event.stopPropagation(); app.placeBet(${match.fixture.id})" class="text-sm text-green-500 hover:text-green-600 transition-colors">
                            <i class="ri-money-dollar-circle-line mr-1"></i>Bet
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BetHelperApp();
    window.app.setupEventHandlers();
}); 