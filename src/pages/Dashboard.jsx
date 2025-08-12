import React, { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import KPIChip from '../components/KPIChip.jsx';
import ErrorState from '../components/ErrorState.jsx';
import SmartMatchCard from '../components/SmartMatchCard.jsx';
import { useLiveMatches, useFixturesRange } from '../hooks/useMatches';
import { useLeagues } from '../hooks/useLeagues';
import { toISODate, addDays } from '../utils/date';

export default function Dashboard() {
  const { data: liveData, loading: liveLoading, error: liveError } = useLiveMatches();
  const today = toISODate();
  const nextWeek = addDays(today, 7);
  const { data: fixturesData, loading: fixturesLoading, error: fixturesError } = useFixturesRange(today, nextWeek);
  const { data: leaguesData, loading: leaguesLoading } = useLeagues();
  
  const live = useMemo(() => liveData?.response ?? [], [liveData]);
  const fixtures = useMemo(() => fixturesData?.response ?? [], [fixturesData]);
  const leagues = useMemo(() => leaguesData?.response ?? [], [leaguesData]);
  
  // Calculate real stats from API data
  const stats = useMemo(() => {
    const todayFixtures = fixtures.filter(match => {
      const matchDate = new Date(match.fixture?.date).toDateString();
      const todayDate = new Date().toDateString();
      return matchDate === todayDate;
    });
    
    return {
      liveMatches: live.length,
      teamsAnalyzed: fixtures.length,
      predictionRate: fixtures.length > 0 ? Math.round((live.length / fixtures.length) * 100 * 10) / 10 : 0,
      activeTournaments: leagues.length
    };
  }, [live, fixtures, leagues]);
  
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
            <div className="stat-icon">LIVE</div>
            <div className="stat-content">
              <div className="stat-label">Today</div>
              <div className="stat-value">{stats.liveMatches}</div>
              <div className="stat-detail">Live Matches</div>
              <div className="stat-trend">{stats.liveMatches > 0 ? `${stats.liveMatches} in progress` : 'No live matches'}</div>
            </div>
          </div>
          
          <div className="stat-card stat-card-blue">
            <div className="stat-icon">WEEK</div>
            <div className="stat-content">
              <div className="stat-label">This Week</div>
              <div className="stat-value">{stats.teamsAnalyzed}</div>
              <div className="stat-detail">Fixtures Tracked</div>
              <div className="stat-trend">{fixtures.length > 0 ? 'Updated live' : 'Loading data'}</div>
            </div>
          </div>
          
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">RATE</div>
            <div className="stat-content">
              <div className="stat-label">Activity</div>
              <div className="stat-value">{stats.predictionRate}%</div>
              <div className="stat-detail">Match Coverage</div>
              <div className="stat-trend">{leagues.length > 0 ? 'Real-time data' : 'Loading leagues'}</div>
            </div>
          </div>
          
          <div className="stat-card stat-card-orange">
            <div className="stat-icon">COMP</div>
            <div className="stat-content">
              <div className="stat-label">Active</div>
              <div className="stat-value">{stats.activeTournaments}</div>
              <div className="stat-detail">Competitions</div>
              <div className="stat-trend">{leagues.length > 0 ? 'Multiple countries' : 'Loading data'}</div>
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
          {liveError && <ErrorState title="Failed to load matches" message="Please try again later" />}
          
          {!liveLoading && !liveError && (
            <div className="live-matches-grid">
              {live.length > 0 ? (
                live.slice(0, 2).map((match) => (
                  <div key={match.fixture?.id} className="live-match-card">
                    <div className="match-header">
                      <span className="match-status">
                        LIVE - {match.fixture?.status?.elapsed || 0}'
                      </span>
                      <span className="match-league">{match.league?.name || 'League'}</span>
                    </div>
                    <div className="match-teams">
                      <div className="team team-home">
                        <span className="team-initial">
                          {match.teams?.home?.name?.charAt(0) || 'H'}
                        </span>
                        <span className="team-name">{match.teams?.home?.name || 'Home Team'}</span>
                      </div>
                      <div className="match-score">
                        <span className="score">
                          {match.goals?.home || 0} - {match.goals?.away || 0}
                        </span>
                      </div>
                      <div className="team team-away">
                        <span className="team-initial">
                          {match.teams?.away?.name?.charAt(0) || 'A'}
                        </span>
                        <span className="team-name">{match.teams?.away?.name || 'Away Team'}</span>
                      </div>
                    </div>
                    <div className="match-footer">
                      <span className="venue">Venue: {match.fixture?.venue?.name || 'Stadium'}</span>
                      <span className="status">{match.fixture?.status?.long || 'In Progress'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <ErrorState 
                  title="No Live Matches" 
                  message="There are currently no live matches. Check back during match days." 
                />
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
            <div className="chart-icon">CHART</div>
            <div className="chart-text">Performance analytics chart would be displayed here</div>
            <div className="chart-subtext">Real-time data visualization</div>
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="upcoming-section">
          <h2 className="section-title">Upcoming Matches</h2>
          {fixturesLoading && <Loader label="Loading upcoming matches" />}
          {fixturesError && <ErrorState title="Failed to load fixtures" message="Please try again later" />}
          
          {!fixturesLoading && !fixturesError && (
            <div className="upcoming-matches">
              {fixtures.length > 0 ? (
                fixtures.slice(0, 3).map((match) => {
                  const matchDate = new Date(match.fixture?.date);
                  const isToday = matchDate.toDateString() === new Date().toDateString();
                  const isTomorrow = matchDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                  
                  let timeDisplay = matchDate.toLocaleDateString() + ', ' + matchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  if (isToday) timeDisplay = 'Today, ' + matchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  if (isTomorrow) timeDisplay = 'Tomorrow, ' + matchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  
                  return (
                    <div key={match.fixture?.id} className="upcoming-match">
                      <div className="match-time">{timeDisplay}</div>
                      <div className="match-teams-upcoming">
                        <div className="team-upcoming">
                          <span className="team-initial-upcoming">
                            {match.teams?.home?.name?.charAt(0) || 'H'}
                          </span>
                          {match.teams?.home?.name || 'Home Team'}
                        </div>
                        <span className="vs">VS</span>
                        <div className="team-upcoming">
                          <span className="team-initial-upcoming">
                            {match.teams?.away?.name?.charAt(0) || 'A'}
                          </span>
                          {match.teams?.away?.name || 'Away Team'}
                        </div>
                      </div>
                      <div className="match-league-upcoming">{match.league?.name || 'League'}</div>
                      <div className="match-venue">
                        <span className="venue-label">Venue</span>
                        <span className="venue-value">{match.fixture?.venue?.name || 'Stadium'}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <ErrorState 
                  title="No Upcoming Matches" 
                  message="No fixtures scheduled for the next week." 
                />
              )}
            </div>
          )}
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

          <div className="leagues-section">
            <h4 className="subsection-title">Active Leagues</h4>
            {leaguesLoading && <Loader label="Loading leagues" size="small" />}
            {!leaguesLoading && (
              <div className="leagues-list">
                {leagues.slice(0, 5).map((league, index) => (
                  <div key={league.league?.id} className="league-item">
                    <div className="league-rank">{index + 1}</div>
                    <div className="league-info">
                      <span className="league-name">{league.league?.name || 'League'}</span>
                      <span className="league-country">{league.country?.name || 'Country'}</span>
                    </div>
                    <div className="league-status">
                      <span className="season">{league.seasons?.[0]?.year || 'Season'}</span>
                    </div>
                  </div>
                ))}
                {leagues.length === 0 && (
                  <div className="no-data">No leagues available</div>
                )}
              </div>
            )}
          </div>

          <div className="fixtures-summary-section">
            <h4 className="subsection-title">Upcoming This Week</h4>
            {!fixturesLoading && (
              <div className="fixtures-summary">
                {fixtures.slice(0, 3).map((match, index) => {
                  const matchDate = new Date(match.fixture?.date);
                  return (
                    <div key={match.fixture?.id} className="fixture-summary-item">
                      <div className="fixture-date">
                        {matchDate.toLocaleDateString([], {month: 'short', day: 'numeric'})}
                      </div>
                      <div className="fixture-teams">
                        <span className="team-short">{match.teams?.home?.name?.substring(0, 10) || 'Home'}</span>
                        <span className="vs-small">vs</span>
                        <span className="team-short">{match.teams?.away?.name?.substring(0, 10) || 'Away'}</span>
                      </div>
                    </div>
                  );
                })}
                {fixtures.length === 0 && (
                  <div className="no-data">No upcoming fixtures</div>
                )}
              </div>
            )}
          </div>

          <div className="insights-section">
            <h4 className="subsection-title">System Status</h4>
            <div className="insight-cards">
              <div className="insight-card">
                <div className="insight-icon">LIVE</div>
                <div className="insight-content">
                  <div className="insight-title">Live Data</div>
                  <div className="insight-text">{live.length > 0 ? `${live.length} matches currently live` : 'No live matches currently'}</div>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">DATA</div>
                <div className="insight-content">
                  <div className="insight-title">API Status</div>
                  <div className="insight-text">{fixtures.length > 0 ? 'Connected and receiving data' : 'Loading fixture data'}</div>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">COMP</div>
                <div className="insight-content">
                  <div className="insight-title">Coverage</div>
                  <div className="insight-text">{leagues.length > 0 ? `Tracking ${leagues.length} competitions` : 'Loading competitions'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}


