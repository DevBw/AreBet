import React, { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import KPIChip from '../components/KPIChip.jsx';
import ErrorState from '../components/ErrorState.jsx';
import SmartMatchCard from '../components/SmartMatchCard.jsx';
import { useLiveMatches, useFixturesRange } from '../hooks/useMatches';
import { toISODate } from '../utils/date';

export default function Dashboard() {
  const { data: liveData, loading: liveLoading, error: liveError } = useLiveMatches();
  const today = toISODate();
  const { data: fixturesData, loading: fixturesLoading, error: fixturesError } = useFixturesRange(today, today);
  const live = useMemo(() => liveData?.response ?? [], [liveData]);
  const fixtures = useMemo(() => fixturesData?.response ?? [], [fixturesData]);
  
  // Mock data for demo purposes
  const mockStats = {
    liveMatches: 24,
    teamsAnalyzed: 156,
    predictionRate: 87.3,
    activeTournaments: 12
  };
  
  const [activeFilters, setActiveFilters] = useState({
    premierLeague: true,
    championsLeague: false,
    laLiga: true,
    serieA: false
  });
  
  const [dateRange, setDateRange] = useState({
    from: 'Dec 15, 2024',
    to: 'Dec 22, 2024'
  });

  const toggleFilter = (filter) => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  return (
    <div className="new-dashboard">
      {/* Left Sidebar - Filters & Options */}
      <aside className="dashboard-left-sidebar">
        <div className="sidebar-section">
          <h3 className="sidebar-title">Filters & Options</h3>
          
          <div className="filter-group">
            <h4 className="filter-group-title">Tournaments</h4>
            <div className="filter-toggles">
              <label className="filter-toggle">
                <input 
                  type="checkbox" 
                  checked={activeFilters.premierLeague}
                  onChange={() => toggleFilter('premierLeague')}
                />
                <span className="toggle-slider"></span>
                Premier League
              </label>
              <label className="filter-toggle">
                <input 
                  type="checkbox" 
                  checked={activeFilters.championsLeague}
                  onChange={() => toggleFilter('championsLeague')}
                />
                <span className="toggle-slider"></span>
                Champions League
              </label>
              <label className="filter-toggle">
                <input 
                  type="checkbox" 
                  checked={activeFilters.laLiga}
                  onChange={() => toggleFilter('laLiga')}
                />
                <span className="toggle-slider"></span>
                La Liga
              </label>
              <label className="filter-toggle">
                <input 
                  type="checkbox" 
                  checked={activeFilters.serieA}
                  onChange={() => toggleFilter('serieA')}
                />
                <span className="toggle-slider"></span>
                Serie A
              </label>
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-group-title">Date Range</h4>
            <div className="date-inputs">
              <div className="date-input-group">
                <label>From: {dateRange.from}</label>
                <input type="date" className="date-input" />
              </div>
              <div className="date-input-group">
                <label>To: {dateRange.to}</label>
                <input type="date" className="date-input" />
              </div>
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-group-title">Favorite Teams</h4>
            <div className="favorite-teams">
              <div className="team-chip team-chip-active">
                <span className="team-initial">M</span>
                Manchester United
              </div>
              <div className="team-chip">
                <span className="team-initial">C</span>
                Chelsea FC
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Football Insights Dashboard</h1>
          <p className="dashboard-subtitle">Comprehensive analysis and statistics for football matches</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-green">
            <div className="stat-icon">⚽</div>
            <div className="stat-content">
              <div className="stat-label">Today</div>
              <div className="stat-value">{mockStats.liveMatches}</div>
              <div className="stat-detail">Live Matches</div>
              <div className="stat-trend">• 8 in progress</div>
            </div>
          </div>
          
          <div className="stat-card stat-card-blue">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-label">This Week</div>
              <div className="stat-value">{mockStats.teamsAnalyzed}</div>
              <div className="stat-detail">Teams Analyzed</div>
              <div className="stat-trend">+12% from last week</div>
            </div>
          </div>
          
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Accuracy</div>
              <div className="stat-value">{mockStats.predictionRate}%</div>
              <div className="stat-detail">Prediction Rate</div>
              <div className="stat-trend">+2.1% improvement</div>
            </div>
          </div>
          
          <div className="stat-card stat-card-orange">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-label">Active</div>
              <div className="stat-value">{mockStats.activeTournaments}</div>
              <div className="stat-detail">Tournaments</div>
              <div className="stat-trend">Across 8 countries</div>
            </div>
          </div>
        </div>

        {/* Live Matches Section */}
        <div className="live-matches-section">
          <div className="section-header">
            <h2 className="section-title">Live Matches</h2>
            <a href="/live" className="view-all-link">View All</a>
          </div>
          
          {liveLoading && <Loader label="Loading live matches" />}
          {liveError && <ErrorState title="Failed to load matches" message="Please try again later" icon="⚽" />}
          
          {!liveLoading && !liveError && (
            <div className="live-matches-grid">
              {live.length > 0 ? (
                live.slice(0, 2).map((match) => (
                  <div key={match.fixture?.id} className="live-match-card">
                    <div className="match-header">
                      <span className="match-status">LIVE - 67'</span>
                      <span className="match-league">Premier League</span>
                    </div>
                    <div className="match-teams">
                      <div className="team team-home">
                        <span className="team-initial">M</span>
                        <span className="team-name">{match.teams?.home?.name || 'Manchester United'}</span>
                      </div>
                      <div className="match-score">
                        <span className="score">{match.goals?.home || 2} - {match.goals?.away || 1}</span>
                      </div>
                      <div className="team team-away">
                        <span className="team-initial">C</span>
                        <span className="team-name">{match.teams?.away?.name || 'Chelsea FC'}</span>
                      </div>
                    </div>
                    <div className="match-footer">
                      <span className="next-goal">Next Goal Probability</span>
                      <span className="probability">Manchester United 65%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sample-live-match">
                  <div className="match-header">
                    <span className="match-status">LIVE - 67'</span>
                    <span className="match-league">Premier League</span>
                  </div>
                  <div className="match-teams">
                    <div className="team team-home">
                      <span className="team-initial">M</span>
                      <span className="team-name">Manchester United</span>
                    </div>
                    <div className="match-score">
                      <span className="score">2 - 1</span>
                    </div>
                    <div className="team team-away">
                      <span className="team-initial">C</span>
                      <span className="team-name">Chelsea FC</span>
                    </div>
                  </div>
                  <div className="match-footer">
                    <span className="next-goal">Next Goal Probability</span>
                    <span className="probability">Manchester United 65%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team Performance Trends */}
        <div className="trends-section">
          <div className="section-header">
            <h2 className="section-title">Team Performance Trends</h2>
          </div>
          <div className="chart-placeholder">
            <div className="chart-icon">📈</div>
            <div className="chart-text">Performance analytics chart would be displayed here</div>
            <div className="chart-subtext">Real-time data visualization</div>
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="upcoming-section">
          <h2 className="section-title">Upcoming Matches</h2>
          <div className="upcoming-matches">
            <div className="upcoming-match">
              <div className="match-time">Tomorrow, 15:30</div>
              <div className="match-teams-upcoming">
                <div className="team-upcoming">
                  <span className="team-initial-upcoming">L</span>
                  Liverpool FC
                </div>
                <span className="vs">VS</span>
                <div className="team-upcoming">
                  <span className="team-initial-upcoming">D</span>
                  Borussia Dortmund
                </div>
              </div>
              <div className="match-league-upcoming">Champions League</div>
              <div className="win-probability">
                <span className="probability-label">Win Probability</span>
                <span className="probability-value">Liverpool 72%</span>
              </div>
            </div>
            
            <div className="upcoming-match">
              <div className="match-time">Dec 20, 18:00</div>
              <div className="match-teams-upcoming">
                <div className="team-upcoming">
                  <span className="team-initial-upcoming">J</span>
                  Juventus FC
                </div>
                <span className="vs">VS</span>
                <div className="team-upcoming">
                  <span className="team-initial-upcoming">M</span>
                  AC Milan
                </div>
              </div>
              <div className="match-league-upcoming">Serie A</div>
              <div className="expected-goals">
                <span className="goals-label">Expected Goals</span>
                <span className="goals-value">2.3 - 1.8</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Live Analytics */}
      <aside className="dashboard-right-sidebar">
        <div className="sidebar-section">
          <h3 className="sidebar-title">Live Analytics</h3>
          
          <div className="trending-section">
            <h4 className="subsection-title">Trending Now</h4>
            <div className="trending-stats">
              <div className="trending-stat">
                <span className="stat-name">Goals per Match</span>
                <span className="stat-number">2.7 avg</span>
                <div className="stat-bar">
                  <div className="stat-progress" style={{width: '75%'}}></div>
                </div>
              </div>
              <div className="trending-stat">
                <span className="stat-name">Clean Sheets</span>
                <span className="stat-number">34%</span>
                <div className="stat-bar">
                  <div className="stat-progress" style={{width: '34%'}}></div>
                </div>
              </div>
              <div className="trending-stat">
                <span className="stat-name">Home Win Rate</span>
                <span className="stat-number">45%</span>
                <div className="stat-bar">
                  <div className="stat-progress" style={{width: '45%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="top-performers-section">
            <h4 className="subsection-title">Top Performers</h4>
            <div className="performers-list">
              <div className="performer-item">
                <div className="performer-rank">1</div>
                <div className="performer-info">
                  <span className="performer-name">Erling Haaland</span>
                  <span className="performer-team">Manchester City</span>
                </div>
                <div className="performer-stat">
                  <span className="stat-value">18</span>
                  <span className="stat-label">Goals</span>
                </div>
              </div>
              <div className="performer-item">
                <div className="performer-rank">2</div>
                <div className="performer-info">
                  <span className="performer-name">Harry Kane</span>
                  <span className="performer-team">Bayern Munich</span>
                </div>
                <div className="performer-stat">
                  <span className="stat-value">16</span>
                  <span className="stat-label">Goals</span>
                </div>
              </div>
              <div className="performer-item">
                <div className="performer-rank">3</div>
                <div className="performer-info">
                  <span className="performer-name">Kylian Mbappé</span>
                  <span className="performer-team">Real Madrid</span>
                </div>
                <div className="performer-stat">
                  <span className="stat-value">14</span>
                  <span className="stat-label">Goals</span>
                </div>
              </div>
            </div>
          </div>

          <div className="league-table-section">
            <h4 className="subsection-title">Premier League Top 5</h4>
            <div className="league-table">
              <div className="table-row">
                <span className="position">1</span>
                <span className="team-name">Liverpool</span>
                <span className="points">45 pts</span>
                <span className="form">+28</span>
              </div>
              <div className="table-row">
                <span className="position">2</span>
                <span className="team-name">Arsenal</span>
                <span className="points">42 pts</span>
                <span className="form">+22</span>
              </div>
              <div className="table-row">
                <span className="position">3</span>
                <span className="team-name">Chelsea</span>
                <span className="points">38 pts</span>
                <span className="form">+18</span>
              </div>
              <div className="table-row">
                <span className="position">4</span>
                <span className="team-name">Manchester City</span>
                <span className="points">35 pts</span>
                <span className="form">+15</span>
              </div>
              <div className="table-row">
                <span className="position">5</span>
                <span className="team-name">Newcastle</span>
                <span className="points">32 pts</span>
                <span className="form">+8</span>
              </div>
            </div>
          </div>

          <div className="insights-section">
            <h4 className="subsection-title">Today's Insights</h4>
            <div className="insight-cards">
              <div className="insight-card insight-hot">
                <div className="insight-icon">🔥</div>
                <div className="insight-content">
                  <div className="insight-title">Hot Streak</div>
                  <div className="insight-text">Manchester United has won 5 consecutive matches</div>
                </div>
              </div>
              <div className="insight-card insight-defensive">
                <div className="insight-icon">🛡️</div>
                <div className="insight-content">
                  <div className="insight-title">Defensive Record</div>
                  <div className="insight-text">Arsenal hasn't conceded in last 3 games</div>
                </div>
              </div>
              <div className="insight-card insight-accuracy">
                <div className="insight-icon">🎯</div>
                <div className="insight-content">
                  <div className="insight-title">Accuracy Alert</div>
                  <div className="insight-text">87% of predictions were correct this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}


