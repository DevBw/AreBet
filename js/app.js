// BetHelper App JavaScript
class BetHelper {
  constructor() {
    this.currentMatches = [];
    this.savedMatches = JSON.parse(localStorage.getItem('savedMatches') || '[]');
    this.init();
  }

  init() {
    this.initDateTabs();
    this.initBottomNavigation();
    this.initMatchActions();
    this.initFloatingActionButton();
    this.initNotifications();
    this.loadInitialData();
  }

  // Load initial data
  async loadInitialData() {
    try {
      console.log('Loading initial data...');
      console.log('API Key:', apiService.apiKey);
      
      // Check if API key is set
      if (!apiService.apiKey || apiService.apiKey === 'YOUR_API_FOOTBALL_KEY') {
        console.log('API key not set, showing modal...');
        this.showApiKeyModal();
        return;
      }

      console.log('API key is set, loading today\'s matches...');
      // Load today's matches by default
      await this.loadMatchData('Today');
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.showNotification('Error loading match data. Please check your API key.', 'error');
    }
  }

  // Show API key setup modal
  showApiKeyModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-4/5 max-w-md fade-in">
        <div class="text-xl font-bold mb-4 text-center">Setup API Key</div>
        <div class="text-sm text-gray-600 mb-4">
          To use BetHelper with real football data, you need an API key from API-Football.
          <br><br>
          <strong>Steps:</strong>
          <ol class="list-decimal list-inside mt-2 space-y-1">
            <li>Visit <a href="https://www.api-football.com/" target="_blank" class="text-primary underline">api-football.com</a></li>
            <li>Sign up for a free account</li>
            <li>Get your API key from the dashboard</li>
            <li>Enter it below</li>
          </ol>
        </div>
        <div class="mb-4">
          <input type="text" id="apiKeyInput" placeholder="Enter your API key" 
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
        </div>
        <div class="flex space-x-2">
          <button id="saveApiKey" class="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            Save & Continue
          </button>
          <button id="skipApiKey" class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            Skip for Now
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    modal.querySelector('#saveApiKey').addEventListener('click', () => {
      const apiKey = modal.querySelector('#apiKeyInput').value.trim();
      if (apiKey) {
        apiService.apiKey = apiKey;
        document.body.removeChild(modal);
        this.loadInitialData();
        this.showNotification('API key saved successfully!', 'success');
      } else {
        this.showNotification('Please enter a valid API key', 'error');
      }
    });

    modal.querySelector('#skipApiKey').addEventListener('click', () => {
      document.body.removeChild(modal);
      this.showNotification('You can set your API key later in the settings', 'info');
    });

    document.body.appendChild(modal);
  }

  // Date Tab Switching
  initDateTabs() {
    const dateTabs = document.querySelectorAll('.bg-gray-100.p-1.rounded-full button');
    
    dateTabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        // Remove active class from all tabs
        dateTabs.forEach((t) => {
          t.classList.remove('bg-primary', 'text-white');
          t.classList.add('text-gray-700');
        });

        // Add active class to clicked tab
        e.target.classList.add('bg-primary', 'text-white');
        e.target.classList.remove('text-gray-700');

        // Simulate loading new data
        this.loadMatchData(e.target.textContent.trim());
      });
    });
  }

  // Bottom Navigation
  initBottomNavigation() {
    const navItems = document.querySelectorAll('.grid-cols-5 a');

    navItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all items
        navItems.forEach((navItem) => {
          const icon = navItem.querySelector('i');
          const text = navItem.querySelector('span');

          icon.classList.remove('text-primary');
          icon.classList.add('text-gray-500');
          text.classList.remove('text-primary', 'font-medium');
          text.classList.add('text-gray-500');
        });

        // Add active class to clicked item
        const icon = item.querySelector('i');
        const text = item.querySelector('span');

        icon.classList.remove('text-gray-500');
        icon.classList.add('text-primary');
        text.classList.remove('text-gray-500');
        text.classList.add('text-primary', 'font-medium');

        // Handle navigation
        this.handleNavigation(text.textContent.trim());
      });
    });
  }

  // Match Actions (Save/Bet buttons)
  initMatchActions() {
    // Save buttons
    const saveButtons = document.querySelectorAll('button[data-action="save"]');
    
    saveButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const matchId = parseInt(button.dataset.matchId);
        const match = this.currentMatches.find(m => m.id === matchId);
        
        if (!match) return;

        const icon = button.querySelector('i');
        const span = button.querySelector('span');

        if (icon.classList.contains('ri-bookmark-line')) {
          // Save match
          this.savedMatches.push(match);
          localStorage.setItem('savedMatches', JSON.stringify(this.savedMatches));
          
          icon.classList.remove('ri-bookmark-line');
          icon.classList.add('ri-bookmark-fill');
          button.classList.remove('bg-gray-100', 'text-gray-700');
          button.classList.add('bg-secondary', 'text-white');
          span.textContent = 'Saved';
          this.showNotification('Match saved!', 'success');
        } else {
          // Remove saved match
          this.savedMatches = this.savedMatches.filter(m => m.id !== matchId);
          localStorage.setItem('savedMatches', JSON.stringify(this.savedMatches));
          
          icon.classList.remove('ri-bookmark-fill');
          icon.classList.add('ri-bookmark-line');
          button.classList.remove('bg-secondary', 'text-white');
          button.classList.add('bg-gray-100', 'text-gray-700');
          span.textContent = 'Save';
          this.showNotification('Match removed from saved', 'info');
        }
      });
    });

    // Bet buttons
    const betButtons = document.querySelectorAll('button[data-action="bet"]');
    
    betButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const matchId = parseInt(button.dataset.matchId);
        const match = this.currentMatches.find(m => m.id === matchId);
        
        if (match) {
          this.showBettingModal(match);
        } else {
          this.showBettingModal();
        }
      });
    });
  }

  // Floating Action Button
  initFloatingActionButton() {
    const fabButton = document.querySelector('.fixed.right-4.bottom-20 button');
    
    fabButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.showQuickActionsModal();
    });
  }

  // Notifications
  initNotifications() {
    const notificationIcon = document.querySelector('.ri-notification-3-line');
    const searchIcon = document.querySelector('.ri-search-line');
    const userIcon = document.querySelector('.ri-user-3-line');

    notificationIcon.parentElement.addEventListener('click', () => {
      this.showNotification('No new notifications', 'info');
    });

    searchIcon.parentElement.addEventListener('click', () => {
      this.showSearchModal();
    });

    userIcon.parentElement.addEventListener('click', () => {
      this.showProfileModal();
    });
  }

  // Helper Methods
  async loadMatchData(period) {
    try {
      console.log(`Loading matches for: ${period}`);
      this.showNotification(`Loading ${period.toLowerCase()} matches...`, 'info');
      
      let apiData;
      switch (period) {
        case 'Today':
          console.log('Fetching today\'s matches...');
          apiData = await apiService.getTodayMatches();
          break;
        case 'Tomorrow':
          console.log('Fetching tomorrow\'s matches...');
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          apiData = await apiService.getMatchesByDate(tomorrowStr);
          break;
        case 'Weekend':
          console.log('Fetching weekend matches...');
          // For weekend, we'll get today's matches as fallback
          apiData = await apiService.getTodayMatches();
          break;
        default:
          console.log('Fetching today\'s matches (default)...');
          apiData = await apiService.getTodayMatches();
      }

      console.log('API Data received:', apiData);
      
      if (!apiData || !apiData.response || apiData.response.length === 0) {
        console.log('No matches found for this period');
        this.showNoMatchesMessage();
        return;
      }
      
      // Transform API data to our format
      this.currentMatches = apiData.response.map(match => ({
        id: match.fixture.id,
        date: match.fixture.date,
        time: new Date(match.fixture.date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        teams: {
          home: {
            id: match.teams.home.id,
            name: match.teams.home.name,
            logo: match.teams.home.logo
          },
          away: {
            id: match.teams.away.id,
            name: match.teams.away.name,
            logo: match.teams.away.logo
          }
        },
        league: {
          id: match.league.id,
          name: match.league.name,
          logo: match.league.logo
        },
        status: match.fixture.status,
        venue: match.fixture.venue?.name || 'TBD'
      }));
      
      console.log('Transformed matches:', this.currentMatches);
      
      // Only process first 3 matches to avoid overwhelming the API
      this.currentMatches = this.currentMatches.slice(0, 3);
      
      await this.renderMatches();
      this.showNotification(`Loaded ${this.currentMatches.length} matches`, 'success');
    } catch (error) {
      console.error('Error loading match data:', error);
      this.showNotification('Error loading matches. Please try again.', 'error');
      this.showNoMatchesMessage();
    }
  }

  // Show message when no matches are found
  showNoMatchesMessage() {
    const container = document.querySelector('#matchesContainer');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-6xl mb-4">⚽</div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No Matches Today</h3>
          <p class="text-gray-500 mb-6">There are no football matches scheduled for today.</p>
          <div class="space-y-3">
            <button onclick="betHelper.loadMatchData('Tomorrow')" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
              Check Tomorrow's Matches
            </button>
            <button onclick="betHelper.loadMatchData('Weekend')" class="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors ml-3">
              Check Weekend Matches
            </button>
          </div>
          <div class="mt-6 text-sm text-gray-400">
            <p>💡 Tip: Try checking different dates or leagues for more matches</p>
          </div>
        </div>
      `;
    }
  }

  // Render matches in the UI
  async renderMatches() {
    const matchesContainer = document.querySelector('#matchesContainer');
    if (!matchesContainer) return;

    if (this.currentMatches.length === 0) {
      matchesContainer.innerHTML = `
        <div class="text-center py-8">
          <i class="ri-football-line ri-3x text-gray-400 mb-4"></i>
          <p class="text-gray-500">No matches found for this period</p>
        </div>
      `;
      return;
    }

    // Show loading state
    matchesContainer.innerHTML = `
      <div class="text-center py-8">
        <i class="ri-loader-4-line ri-2x text-primary animate-spin mb-4"></i>
        <p class="text-gray-500">Loading match predictions...</p>
      </div>
    `;

    try {
      // Create match cards with predictions (with delays to respect rate limits)
      const matchCards = [];
      for (let i = 0; i < this.currentMatches.length; i++) {
        const match = this.currentMatches[i];
        console.log(`Processing match ${i + 1}/${this.currentMatches.length}: ${match.teams.home.name} vs ${match.teams.away.name}`);
        
        const matchCard = await this.createMatchCard(match);
        matchCards.push(matchCard);
        
        // Add delay between predictions to respect API rate limits
        if (i < this.currentMatches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 7000)); // 7 second delay
        }
      }
      
      matchesContainer.innerHTML = matchCards.join('');
      
      // Re-initialize match actions after rendering
      this.initMatchActions();
    } catch (error) {
      console.error('Error rendering matches:', error);
      matchesContainer.innerHTML = `
        <div class="text-center py-8">
          <i class="ri-error-warning-line ri-2x text-red-500 mb-4"></i>
          <p class="text-gray-500">Error loading matches. Please try again.</p>
        </div>
      `;
    }
  }

  // Create match card HTML with advanced features
  async createMatchCard(match) {
    const isSaved = this.savedMatches.some(saved => saved.id === match.id);
    const matchTime = new Date(match.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const matchDate = new Date(match.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    // Get prediction data
    const prediction = await this.getPrediction(match);
    const homeWinProb = Math.round(prediction.homeWinProb * 100);
    const awayWinProb = Math.round(prediction.awayWinProb * 100);
    const drawProb = Math.round(prediction.drawProb * 100);

    // Get team form (simplified for now)
    const homeForm = ['W', 'D', 'L', 'W', 'W'];
    const awayForm = ['L', 'W', 'D', 'L', 'W'];

    return `
      <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow" data-match-id="${match.id}">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <img src="${match.league.logo}" alt="${match.league.name}" class="w-6 h-6 rounded-full">
            <span class="text-sm font-medium text-gray-700">${match.league.name}</span>
          </div>
          <div class="text-xs text-gray-500">
            <div>${matchDate}</div>
            <div>${matchTime}</div>
          </div>
        </div>
        
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3 flex-1">
            <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="w-12 h-12 rounded-full">
            <div class="flex-1">
              <div class="font-medium text-gray-900">${match.teams.home.name}</div>
              <div class="text-sm text-gray-500">Home</div>
              <div class="flex space-x-1 mt-1">
                ${homeForm.map(result => `
                  <span class="w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold ${
                    result === 'W' ? 'bg-green-500 text-white' :
                    result === 'D' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }">${result}</span>
                `).join('')}
              </div>
            </div>
          </div>
          
          <div class="text-center mx-4">
            <div class="text-lg font-bold text-gray-900">VS</div>
            <div class="text-xs text-gray-500">${match.status.short}</div>
          </div>
          
          <div class="flex items-center space-x-3 flex-1 justify-end">
            <div class="flex-1 text-right">
              <div class="font-medium text-gray-900">${match.teams.away.name}</div>
              <div class="text-sm text-gray-500">Away</div>
              <div class="flex space-x-1 mt-1 justify-end">
                ${awayForm.map(result => `
                  <span class="w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold ${
                    result === 'W' ? 'bg-green-500 text-white' :
                    result === 'D' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }">${result}</span>
                `).join('')}
              </div>
            </div>
            <img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="w-12 h-12 rounded-full">
          </div>
        </div>

        <!-- Win Probability Bar -->
        <div class="flex bg-gray-50 rounded-lg p-2 mb-3">
          <div class="flex-1 flex items-center justify-center">
            <span class="text-sm font-medium text-primary">${homeWinProb}%</span>
          </div>
          <div class="flex-1 flex items-center justify-center">
            <span class="text-sm font-medium text-yellow-500">${drawProb}%</span>
          </div>
          <div class="flex-1 flex items-center justify-center">
            <span class="text-sm font-medium text-red-500">${awayWinProb}%</span>
          </div>
        </div>

        <!-- Prediction and Actions -->
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <span class="text-xs px-2 py-1 rounded-full ${
              prediction.prediction === 'Home Win' ? 'bg-primary bg-opacity-10 text-primary' :
              prediction.prediction === 'Away Win' ? 'bg-red-500 bg-opacity-10 text-red-600' :
              'bg-yellow-500 bg-opacity-10 text-yellow-600'
            }">
              <i class="ri-check-line"></i>
              ${prediction.prediction} (${Math.round(prediction.confidence * 100)}%)
            </span>
          </div>
          
          <div class="flex space-x-2">
            <button class="flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
              isSaved 
                ? 'bg-secondary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }" data-action="save" data-match-id="${match.id}">
              <i class="ri-bookmark-${isSaved ? 'fill' : 'line'}"></i>
              <span>${isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button class="flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm bg-primary text-white hover:bg-primary-dark transition-colors" data-action="bet" data-match-id="${match.id}">
              <i class="ri-external-link-line"></i>
              <span>Bet</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Get prediction for a match with real analysis
      async getPrediction(match) {
      try {
        console.log(`Getting prediction for ${match.teams.home.name} vs ${match.teams.away.name}`);
        
        // Use season 2023 for free API plan compatibility
        const season = 2023;
        
        // Get team statistics with fallback
        let homeStats, awayStats;
        
        try {
          homeStats = await apiService.getTeamStatistics(match.teams.home.id, match.league.id, season);
        } catch (error) {
          console.log(`Failed to get home team stats for ${match.teams.home.name}, using fallback`);
          homeStats = { results: 0, response: [] };
        }
        
        try {
          awayStats = await apiService.getTeamStatistics(match.teams.away.id, match.league.id, season);
        } catch (error) {
          console.log(`Failed to get away team stats for ${match.teams.away.name}, using fallback`);
          awayStats = { results: 0, response: [] };
        }

        // Get head-to-head data with fallback
        let h2hData;
        try {
          h2hData = await apiService.getHeadToHead(match.teams.home.id, match.teams.away.id, season);
        } catch (error) {
          console.log(`Failed to get H2H data, using fallback`);
          h2hData = { results: 0, response: [] };
        }

        // Calculate prediction based on available data
        const prediction = this.calculatePrediction(homeStats, awayStats, h2hData, match);
        
        console.log(`Prediction calculated:`, prediction);
        return prediction;
        
      } catch (error) {
        console.error('Error getting prediction:', error);
        
        // Return fallback prediction
        return {
          homeWinProb: 0.4,
          drawProb: 0.3,
          awayWinProb: 0.3,
          confidence: 0.5,
          prediction: 'Limited data available',
          homeForm: ['W', 'D', 'L', 'W', 'D'],
          awayForm: ['L', 'W', 'D', 'L', 'W'],
          expectedGoals: '2.5',
          keyFactors: ['Basic prediction due to API limitations']
        };
      }
    }

  // Calculate advanced prediction
  calculatePrediction(homeStats, awayStats, h2h, match) {
    let homeScore = 0;
    let awayScore = 0;
    let confidence = 0;

    // Factor 1: Team form (last 5 matches)
    if (homeStats.response && awayStats.response) {
      const homeForm = this.calculateTeamForm(homeStats.response);
      const awayForm = this.calculateTeamForm(awayStats.response);
      
      homeScore += homeForm * 0.3;
      awayScore += awayForm * 0.3;
      confidence += 0.3;
    }

    // Factor 2: Head-to-head record
    if (h2h.response && h2h.response.length > 0) {
      const h2hResult = this.analyzeHeadToHead(h2h.response, match.teams.home.id);
      homeScore += h2hResult.home * 0.2;
      awayScore += h2hResult.away * 0.2;
      confidence += 0.2;
    }

    // Factor 3: Home advantage
    homeScore += 0.1;
    confidence += 0.1;

    // Factor 4: League position (if available)
    if (homeStats.response && awayStats.response) {
      const homePosition = homeStats.response.league?.standings?.[0]?.find(team => team.team.id === match.teams.home.id)?.rank || 10;
      const awayPosition = awayStats.response.league?.standings?.[0]?.find(team => team.team.id === match.teams.away.id)?.rank || 10;
      
      const positionFactor = (20 - homePosition) / 20 * 0.2;
      homeScore += positionFactor;
      awayScore += (20 - awayPosition) / 20 * 0.2;
      confidence += 0.2;
    }

    // Factor 5: Goals scored/conceded
    if (homeStats.response && awayStats.response) {
      const homeGoalsFor = homeStats.response.goals?.for?.total?.total || 0;
      const homeGoalsAgainst = homeStats.response.goals?.against?.total?.total || 0;
      const awayGoalsFor = awayStats.response.goals?.for?.total?.total || 0;
      const awayGoalsAgainst = awayStats.response.goals?.against?.total?.total || 0;
      
      homeScore += (homeGoalsFor / Math.max(homeGoalsAgainst, 1)) * 0.1;
      awayScore += (awayGoalsFor / Math.max(awayGoalsAgainst, 1)) * 0.1;
      confidence += 0.1;
    }

    // Normalize scores
    const totalScore = homeScore + awayScore;
    if (totalScore > 0) {
      homeScore = homeScore / totalScore;
      awayScore = awayScore / totalScore;
    }

    // Determine prediction
    const threshold = 0.1; // Minimum difference to make a prediction
    if (Math.abs(homeScore - awayScore) < threshold) {
      return {
        prediction: 'Draw',
        confidence: Math.min(confidence, 0.8),
        homeWinProb: homeScore,
        awayWinProb: awayScore,
        drawProb: 1 - homeScore - awayScore
      };
    } else if (homeScore > awayScore) {
      return {
        prediction: 'Home Win',
        confidence: Math.min(confidence, 0.9),
        homeWinProb: homeScore,
        awayWinProb: awayScore,
        drawProb: 1 - homeScore - awayScore
      };
    } else {
      return {
        prediction: 'Away Win',
        confidence: Math.min(confidence, 0.9),
        homeWinProb: homeScore,
        awayWinProb: awayScore,
        drawProb: 1 - homeScore - awayScore
      };
    }
  }

  // Calculate team form from statistics
  calculateTeamForm(stats) {
    if (!stats || !stats.fixtures) return 0.5;
    
    const played = stats.fixtures.played?.total || 0;
    const won = stats.fixtures.wins?.total || 0;
    const drawn = stats.fixtures.draws?.total || 0;
    
    if (played === 0) return 0.5;
    
    return (won * 3 + drawn) / (played * 3);
  }

  // Analyze head-to-head data
  analyzeHeadToHead(h2hData, homeTeamId) {
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    let total = 0;

    h2hData.forEach(match => {
      if (match.goals.home !== null && match.goals.away !== null) {
        total++;
        if (match.goals.home > match.goals.away) {
          homeWins++;
        } else if (match.goals.away > match.goals.home) {
          awayWins++;
        } else {
          draws++;
        }
      }
    });

    if (total === 0) return { home: 0.5, away: 0.5 };

    return {
      home: homeWins / total,
      away: awayWins / total
    };
  }

  // Get basic prediction (fallback)
  getBasicPrediction(match) {
    const predictions = ['Home Win', 'Away Win', 'Draw'];
    return {
      prediction: predictions[Math.floor(Math.random() * predictions.length)],
      confidence: 0.5,
      homeWinProb: 0.33,
      awayWinProb: 0.33,
      drawProb: 0.34
    };
  }

  handleNavigation(section) {
    console.log(`Navigating to: ${section}`);
    // In a real app, this would handle routing
    this.showNotification(`${section} section coming soon!`, 'info');
  }

  showBettingModal(match = null) {
    let title = 'Opening Betting Platform';
    let message = 'You will be redirected to place your bet.';
    
    if (match) {
      title = `${match.teams.home.name} vs ${match.teams.away.name}`;
      message = `Ready to place a bet on this match? You'll be redirected to a betting platform.`;
    }
    
    const modal = this.createModal(title, message, [
      { text: 'Cancel', class: 'bg-gray-200 text-gray-800', action: 'close' },
      { text: 'Continue', class: 'bg-primary text-white', action: 'bet' }
    ]);
    
    document.body.appendChild(modal);
  }

  showQuickActionsModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-5 w-4/5 max-w-sm fade-in">
        <div class="text-lg font-medium mb-3">Quick Actions</div>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <button class="bg-gray-100 p-3 rounded-lg flex flex-col items-center hover-scale" data-action="search">
            <i class="ri-search-line ri-xl mb-2"></i>
            <span class="text-sm">Find Match</span>
          </button>
          <button class="bg-gray-100 p-3 rounded-lg flex flex-col items-center hover-scale" data-action="favorites">
            <i class="ri-star-line ri-xl mb-2"></i>
            <span class="text-sm">Favorites</span>
          </button>
          <button class="bg-gray-100 p-3 rounded-lg flex flex-col items-center hover-scale" data-action="calendar">
            <i class="ri-calendar-line ri-xl mb-2"></i>
            <span class="text-sm">Calendar</span>
          </button>
          <button class="bg-gray-100 p-3 rounded-lg flex flex-col items-center hover-scale" data-action="alerts">
            <i class="ri-notification-line ri-xl mb-2"></i>
            <span class="text-sm">Alerts</span>
          </button>
        </div>
        <button class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-button">Close</button>
      </div>
    `;

    // Add event listeners
    modal.querySelectorAll('button[data-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleQuickAction(action);
        document.body.removeChild(modal);
      });
    });

    modal.querySelector('.w-full').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.body.appendChild(modal);
  }

  showSearchModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-5 w-4/5 max-w-md fade-in">
        <div class="text-lg font-medium mb-4">Search Matches</div>
        <div class="mb-4">
          <input type="text" id="searchInput" placeholder="Search teams, leagues..." 
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
        </div>
        <div id="searchResults" class="max-h-64 overflow-y-auto space-y-2 mb-4">
          <div class="text-center text-gray-500 text-sm">Enter a team or league name to search</div>
        </div>
        <div class="flex space-x-2">
          <button id="searchButton" class="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            Search
          </button>
          <button id="closeSearch" class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            Close
          </button>
        </div>
      </div>
    `;

    const searchInput = modal.querySelector('#searchInput');
    const searchButton = modal.querySelector('#searchButton');
    const searchResults = modal.querySelector('#searchResults');
    const closeButton = modal.querySelector('#closeSearch');

    // Search functionality
    const performSearch = async () => {
      const query = searchInput.value.trim();
      if (!query) return;

      searchResults.innerHTML = '<div class="text-center"><i class="ri-loader-4-line animate-spin text-primary"></i> Searching...</div>';

      try {
        // Search in current matches
        const filteredMatches = this.currentMatches.filter(match => 
          match.teams.home.name.toLowerCase().includes(query.toLowerCase()) ||
          match.teams.away.name.toLowerCase().includes(query.toLowerCase()) ||
          match.league.name.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredMatches.length === 0) {
          searchResults.innerHTML = '<div class="text-center text-gray-500">No matches found</div>';
        } else {
          searchResults.innerHTML = filteredMatches.map(match => `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" data-match-id="${match.id}">
              <div class="flex items-center space-x-2">
                <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="w-6 h-6 rounded-full">
                <div>
                  <div class="text-sm font-medium">${match.teams.home.name} vs ${match.teams.away.name}</div>
                  <div class="text-xs text-gray-500">${match.league.name}</div>
                </div>
              </div>
              <i class="ri-arrow-right-s-line text-gray-400"></i>
            </div>
          `).join('');

          // Add click handlers to results
          searchResults.querySelectorAll('[data-match-id]').forEach(item => {
            item.addEventListener('click', () => {
              const matchId = parseInt(item.dataset.matchId);
              const match = this.currentMatches.find(m => m.id === matchId);
              if (match) {
                this.showMatchDetails(match);
                document.body.removeChild(modal);
              }
            });
          });
        }
      } catch (error) {
        searchResults.innerHTML = '<div class="text-center text-red-500">Error searching matches</div>';
      }
    };

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.body.appendChild(modal);
  }

  // Show match details
  showMatchDetails(match) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-5 w-4/5 max-w-md fade-in">
        <div class="text-lg font-medium mb-4">Match Details</div>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="w-12 h-12 rounded-full">
              <div>
                <div class="font-medium">${match.teams.home.name}</div>
                <div class="text-sm text-gray-500">Home</div>
              </div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold">VS</div>
              <div class="text-xs text-gray-500">${match.status.short}</div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="text-right">
                <div class="font-medium">${match.teams.away.name}</div>
                <div class="text-sm text-gray-500">Away</div>
              </div>
              <img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="w-12 h-12 rounded-full">
            </div>
          </div>
          <div class="border-t pt-3">
            <div class="text-sm text-gray-600">
              <div><strong>League:</strong> ${match.league.name}</div>
              <div><strong>Date:</strong> ${new Date(match.date).toLocaleDateString()}</div>
              <div><strong>Time:</strong> ${new Date(match.date).toLocaleTimeString()}</div>
              <div><strong>Venue:</strong> ${match.venue?.name || 'TBD'}</div>
            </div>
          </div>
        </div>
        <button class="w-full mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">Close</button>
      </div>
    `;

    modal.querySelector('button').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.body.appendChild(modal);
  }

  showProfileModal() {
    const modal = this.createModal('User Profile', 
      'Profile management coming soon! Track your betting history and statistics.', 
      [{ text: 'OK', class: 'bg-primary text-white', action: 'close' }]
    );
    
    document.body.appendChild(modal);
  }

  createModal(title, message, buttons) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const buttonHtml = buttons.map(btn => 
      `<button class="${btn.class} px-4 py-2 rounded-button" data-action="${btn.action}">${btn.text}</button>`
    ).join('');
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-5 w-4/5 max-w-sm fade-in">
        <div class="text-lg font-medium mb-3">${title}</div>
        <div class="text-sm text-gray-600 mb-4">${message}</div>
        <div class="flex justify-end space-x-2">
          ${buttonHtml}
        </div>
      </div>
    `;

    // Add event listeners
    modal.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'close') {
          document.body.removeChild(modal);
        } else if (action === 'bet') {
          window.open('https://www.betway.com', '_blank');
          document.body.removeChild(modal);
        }
      });
    });

    return modal;
  }

  handleQuickAction(action) {
    switch (action) {
      case 'search':
        this.showSearchModal();
        break;
      case 'favorites':
        this.showSavedMatches();
        break;
      case 'calendar':
        this.showLeagueSelectionModal();
        break;
      case 'alerts':
        this.showNotification('Alerts feature coming soon!', 'info');
        break;
      default:
        this.showNotification('Feature coming soon!', 'info');
    }
  }

  // Show saved matches
  showSavedMatches() {
    if (this.savedMatches.length === 0) {
      this.showNotification('No saved matches yet', 'info');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-5 w-4/5 max-w-md fade-in max-h-96 overflow-y-auto">
        <div class="text-lg font-medium mb-4">Saved Matches (${this.savedMatches.length})</div>
        <div class="space-y-3">
          ${this.savedMatches.map(match => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="w-8 h-8 rounded-full">
                <div>
                  <div class="font-medium text-sm">${match.teams.home.name} vs ${match.teams.away.name}</div>
                  <div class="text-xs text-gray-500">${match.league.name}</div>
                </div>
              </div>
              <button class="text-red-500 hover:text-red-700" data-match-id="${match.id}">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          `).join('')}
        </div>
        <button class="w-full mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">Close</button>
      </div>
    `;

    // Add event listeners for remove buttons
    modal.querySelectorAll('button[data-match-id]').forEach(button => {
      button.addEventListener('click', (e) => {
        const matchId = parseInt(e.currentTarget.dataset.matchId);
        this.savedMatches = this.savedMatches.filter(m => m.id !== matchId);
        localStorage.setItem('savedMatches', JSON.stringify(this.savedMatches));
        this.showNotification('Match removed from saved', 'success');
        document.body.removeChild(modal);
      });
    });

    modal.querySelector('.w-full.mt-4').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.body.appendChild(modal);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500'
    };
    
    notification.className = `fixed top-20 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 fade-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }

  // Load popular leagues
  async loadPopularLeagues() {
    try {
      const leagues = await this.apiService.getPopularLeagues();
      return leagues;
    } catch (error) {
      console.error('Error loading leagues:', error);
      return [];
    }
  }

  // Show league selection modal
  async showLeagueSelectionModal() {
    const leagues = await this.loadPopularLeagues();
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-5 w-4/5 max-w-md fade-in max-h-96 overflow-y-auto">
        <div class="text-lg font-medium mb-4">Select League</div>
        <div class="space-y-2">
          ${leagues.map(league => `
            <button class="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" data-league-id="${league.league.id}">
              <img src="${league.league.logo}" alt="${league.league.name}" class="w-8 h-8 rounded-full">
              <div class="flex-1 text-left">
                <div class="font-medium text-gray-900">${league.league.name}</div>
                <div class="text-sm text-gray-500">${league.country.name}</div>
              </div>
              <i class="ri-arrow-right-s-line text-gray-400"></i>
            </button>
          `).join('')}
        </div>
        <button class="w-full mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
      </div>
    `;

    // Add event listeners
    modal.querySelectorAll('button[data-league-id]').forEach(button => {
      button.addEventListener('click', (e) => {
        const leagueId = parseInt(e.currentTarget.dataset.leagueId);
        document.body.removeChild(modal);
        this.loadMatchesByLeague(leagueId);
      });
    });

    modal.querySelector('.w-full.mt-4').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.body.appendChild(modal);
  }

  // Load matches by specific league
  async loadMatchesByLeague(leagueId) {
    try {
      this.showNotification('Loading league matches...', 'info');
      
      const todayMatches = await this.apiService.getTodayMatches(leagueId);
      const tomorrowMatches = await this.apiService.getTomorrowMatches(leagueId);
      const weekendMatches = await this.apiService.getWeekendMatches(leagueId);
      
      // Combine all matches
      const allMatches = [
        ...this.apiService.transformFixtureData(todayMatches),
        ...this.apiService.transformFixtureData(tomorrowMatches),
        ...this.apiService.transformFixtureData(weekendMatches)
      ];
      
      this.currentMatches = allMatches;
      await this.renderMatches();
      this.showNotification(`Loaded ${allMatches.length} league matches`, 'success');
    } catch (error) {
      console.error('Error loading league matches:', error);
      this.showNotification('Error loading league matches', 'error');
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BetHelper();
});

// Add some utility functions
window.BetHelper = {
  // Utility to format odds
  formatOdds: (odds) => {
    return parseFloat(odds).toFixed(2);
  },
  
  // Utility to calculate potential winnings
  calculateWinnings: (stake, odds) => {
    return (stake * odds).toFixed(2);
  },
  
  // Utility to format percentage
  formatPercentage: (value) => {
    return `${Math.round(value)}%`;
  }
}; 