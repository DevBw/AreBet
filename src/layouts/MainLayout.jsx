import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLiveMatches, useFixturesRange } from '../hooks/useMatches';
import { useLeagues } from '../hooks/useLeagues';
import { toISODate, addDays } from '../utils/date';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const today = toISODate();
  const nextWeek = addDays(today, 7);
  
  // Check if we're on the dashboard page
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [liveUpdates, setLiveUpdates] = useState([]);
  const { data: liveData, loading: liveLoading, error: liveError, refetch: refetchLive } = useLiveMatches();
  const { data: fixturesData } = useFixturesRange(today, nextWeek);
  const { data: leaguesData } = useLeagues();

  const liveCount = useMemo(() => liveData?.response?.length ?? 0, [liveData]);
  const fixturesCount = useMemo(() => fixturesData?.response?.length ?? 0, [fixturesData]);
  const leaguesCount = useMemo(() => leaguesData?.response?.length ?? 0, [leaguesData]);

  // Generate live updates from current live matches
  const liveUpdatesData = useMemo(() => {
    if (!liveData?.response) return [];
    return liveData.response.slice(0, 5).map(match => ({
      id: match.fixture?.id,
      homeTeam: match.teams?.home?.name || 'Home',
      awayTeam: match.teams?.away?.name || 'Away',
      homeScore: match.goals?.home ?? 0,
      awayScore: match.goals?.away ?? 0,
      status: match.fixture?.status?.short || 'LIVE',
      elapsed: match.fixture?.status?.elapsed || null,
      league: match.league?.name || 'League'
    }));
  }, [liveData]);

  // Auto-refresh live matches every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchLive();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetchLive]);

  // Sample data for when no live matches are available
  const sampleLiveData = [
    {
      id: 'sample-1',
      homeTeam: 'Manchester City',
      awayTeam: 'Liverpool',
      homeScore: 2,
      awayScore: 1,
      status: 'LIVE',
      elapsed: 78,
      league: 'Premier League'
    },
    {
      id: 'sample-2',
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE',
      elapsed: 65,
      league: 'La Liga'
    },
    {
      id: 'sample-3',
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      homeScore: 3,
      awayScore: 0,
      status: 'LIVE',
      elapsed: 82,
      league: 'Bundesliga'
    }
  ];

  // Update live updates state
  useEffect(() => {
    if (liveUpdatesData.length > 0) {
      setLiveUpdates(liveUpdatesData);
    } else if (!liveLoading && !liveError) {
      // Show sample data when no live matches but API call succeeded
      setLiveUpdates(sampleLiveData);
    }
  }, [liveUpdatesData, liveLoading, liveError]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = (formData.get('q') || '').toString().trim();
    if (query) navigate(`/matches?q=${encodeURIComponent(query)}`);
  }

  function toggleFilter(filter) {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveFilters(newFilters);
    
    // Navigate with filter applied
    if (filter === 'LIVE') navigate('/live');
    else if (filter === 'TOP5') navigate('/leagues');
  }

  // For dashboard, use the special layout, for other pages use the original layout
  if (isDashboard) {
    return (
      <div className="ab-app">
        <header className="ab-header" role="banner">
          <div className="ab-brand" aria-label="AreBet home" onClick={() => navigate('/dashboard')} tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' ? navigate('/dashboard') : null)}>
            <img src="/icons/logo.svg" alt="AreBet logo" width="28" height="28" />
            <span className="ab-title">AreBet</span>
          </div>
          <nav className="ab-nav" aria-label="Primary">
            <NavLink to="/dashboard" className="ab-tab" aria-label="Dashboard">
              Dashboard
            </NavLink>
            <NavLink to="/live" className="ab-tab" aria-label="Live Matches">
              Matches
            </NavLink>
            <NavLink to="/teams" className="ab-tab" aria-label="Teams">
              Teams
            </NavLink>
            <NavLink to="/statistics" className="ab-tab" aria-label="Analytics">
              Analytics
            </NavLink>
          </nav>
          <div className="header-right">
            <button className="notification-btn" aria-label="Notifications">
              Alerts
            </button>
            <button className="profile-btn" aria-label="Profile">
              Profile
            </button>
          </div>
        </header>

        <main className="dashboard-container" role="main">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="ab-app">
      <header className="ab-header" role="banner">
        <div className="ab-brand" aria-label="AreBet home" onClick={() => navigate('/dashboard')} tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' ? navigate('/dashboard') : null)}>
          <img src="/icons/logo.svg" alt="AreBet logo" width="28" height="28" />
          <span className="ab-title">AreBet</span>
        </div>
        <nav className="ab-nav" aria-label="Primary">
          <NavLink to="/dashboard" className="ab-tab" aria-label="Dashboard">
            Dashboard
          </NavLink>
          <NavLink to="/live" className="ab-tab" aria-label="Live Matches">
            Matches
          </NavLink>
          <NavLink to="/teams" className="ab-tab" aria-label="Teams">
            Teams
          </NavLink>
          <NavLink to="/statistics" className="ab-tab" aria-label="Analytics">
            Analytics
          </NavLink>
        </nav>
        <form className="ab-search" role="search" aria-label="Search matches" onSubmit={handleSearchSubmit}>
          <input name="q" type="search" placeholder="Search teams, leagues..." aria-label="Search" />
          <button type="submit" className="ab-button">Search</button>
        </form>
      </header>

      <main className="ab-grid" role="main">
        <aside className="ab-col-left" aria-label="Sidebar">
          <div className="ab-card">
            <h3 className="ab-card-title">Navigation</h3>
            <ul className="ab-list" role="tablist" aria-label="Sections" aria-orientation="vertical">
              <li><NavLink to="/dashboard" role="tab" className="ab-list-link">Overview</NavLink></li>
              <li><NavLink to="/trends" role="tab" className="ab-list-link">Trends</NavLink></li>
              <li><NavLink to="/predictions" role="tab" className="ab-list-link">Predictions</NavLink></li>
              <li><NavLink to="/statistics" role="tab" className="ab-list-link">Statistics</NavLink></li>
              <li><NavLink to="/players" role="tab" className="ab-list-link">Players</NavLink></li>
            </ul>
          </div>
          <div className="ab-card">
            <h3 className="ab-card-title">Quick Filters</h3>
            <div className="ab-chip-row">
              <button 
                className={`ab-chip ${activeFilters.has('TOP5') ? 'ab-chip-active' : ''}`}
                aria-pressed={activeFilters.has('TOP5')}
                title="Top 5 leagues"
                onClick={() => toggleFilter('TOP5')}
              >
                TOP 5
              </button>
              <button 
                className={`ab-chip ${activeFilters.has('FAV') ? 'ab-chip-active' : ''}`}
                aria-pressed={activeFilters.has('FAV')}
                title="Favorites"
                onClick={() => toggleFilter('FAV')}
              >
                FAV
              </button>
              <button 
                className={`ab-chip ${activeFilters.has('LIVE') ? 'ab-chip-active' : ''}`}
                aria-pressed={activeFilters.has('LIVE')}
                title="Live now"
                onClick={() => toggleFilter('LIVE')}
              >
                LIVE {liveCount > 0 && <span className="ab-chip-badge">{liveCount}</span>}
              </button>
            </div>
          </div>
          <div className="ab-card">
            <h3 className="ab-card-title">Quick Stats</h3>
            <ul className="ab-stats">
              <li><span>Live</span><strong id="qs-live" aria-live="polite">{liveCount || '--'}</strong></li>
              <li><span>Fixtures</span><strong id="qs-fixtures" aria-live="polite">{fixturesCount || '--'}</strong></li>
              <li><span>Leagues</span><strong id="qs-leagues" aria-live="polite">{leaguesCount || '--'}</strong></li>
            </ul>
          </div>
        </aside>

        <section className="ab-col-main">
          {children}
        </section>

        <aside className="ab-col-right" aria-label="Right rail">
          <div className="ab-card">
            <h3 className="ab-card-title">Live Updates</h3>
            <div className="ab-live" aria-live="polite">
              {liveLoading ? (
                <div className="ab-live-loading">
                  <div className="ab-loader">
                    <span className="ab-loader-text">Loading live matches...</span>
                  </div>
                </div>
              ) : liveError ? (
                <div className="ab-live-error">
                  <div className="ab-error-message">
                    <span>Failed to load live matches</span>
                    <button 
                      onClick={refetchLive}
                      className="ab-retry-button"
                      title="Retry loading live matches"
                    >
                      🔄 Retry
                    </button>
                  </div>
                </div>
              ) : liveUpdates.length > 0 ? (
                <>
                  {liveUpdatesData.length === 0 && liveUpdates.length > 0 && (
                    <div className="ab-sample-notice">
                      <small>📊 Sample live match data</small>
                    </div>
                  )}
                  {liveUpdates.map(update => (
                    <div key={update.id} className="ab-live-update">
                      <div className="ab-live-match">
                        <div className="ab-live-teams">
                          <span className="ab-live-home">{update.homeTeam}</span>
                          <span className="ab-live-score">
                            {update.homeScore} - {update.awayScore}
                          </span>
                          <span className="ab-live-away">{update.awayTeam}</span>
                        </div>
                        <div className="ab-live-status">
                          <span className="ab-live-time">{update.elapsed}'</span>
                          <span className="ab-live-league">{update.league}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="ab-live-empty">No live matches available</div>
              )}
            </div>
          </div>
          <div className="ab-card">
            <h3 className="ab-card-title">Trending</h3>
            <ul className="ab-list">
              <li>Premier League</li>
              <li>La Liga</li>
              <li>Serie A</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="ab-footer" role="contentinfo">
        <nav className="ab-bottom-nav" aria-label="Bottom navigation">
          <NavLink to="/dashboard" className="ab-bottom-link">Home</NavLink>
          <NavLink to="/live" className="ab-bottom-link">Live</NavLink>
          <NavLink to="/matches" className="ab-bottom-link">Matches</NavLink>
          <NavLink to="/leagues" className="ab-bottom-link">Leagues</NavLink>
          <NavLink to="/players" className="ab-bottom-link">Players</NavLink>
        </nav>
      </footer>
    </div>
  );
}


