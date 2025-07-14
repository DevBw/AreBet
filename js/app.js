// BetHelper App - Main Application Logic
class BetHelperApp {
    constructor() {
        this.apiService = new APIService();
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BetHelperApp();
    window.app.setupEventHandlers();
}); 