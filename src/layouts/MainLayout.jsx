import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLiveMatches, useFixturesRange } from '../hooks/useMatches';
import { useLeagues } from '../hooks/useLeagues';
import { toISODate, addDays } from '../utils/date';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const today = toISODate();
  const nextWeek = addDays(today, 7);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [liveUpdates, setLiveUpdates] = useState([]);
  const { data: liveData } = useLiveMatches();
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

  // Update live updates state
  useEffect(() => {
    setLiveUpdates(liveUpdatesData);
  }, [liveUpdatesData]);

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

  return (
    <div className="ab-app">
      <header className="ab-header" role="banner">
        <div className="ab-brand" aria-label="AreBet home" onClick={() => navigate('/dashboard')} tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' ? navigate('/dashboard') : null)}>
          <img src="/icons/logo.svg" alt="AreBet logo" width="28" height="28" />
          <span className="ab-title">AreBet</span>
        </div>
        <nav className="ab-nav" aria-label="Primary">
          <NavLink to="/dashboard" className="ab-tab" aria-label="Dashboard">Dashboard</NavLink>
          <NavLink to="/live" className="ab-tab" aria-label="Live Matches">Live</NavLink>
          <NavLink to="/fixtures" className="ab-tab" aria-label="Fixtures">Fixtures</NavLink>
          <NavLink to="/matches" className="ab-tab" aria-label="Matches">Matches</NavLink>
          <NavLink to="/leagues" className="ab-tab" aria-label="Leagues">Leagues</NavLink>
          <NavLink to="/teams" className="ab-tab" aria-label="Teams">Teams</NavLink>
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
              {liveUpdates.length > 0 ? (
                liveUpdates.map(update => (
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
                ))
              ) : (
                <div className="ab-live-empty">No live matches</div>
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
        </nav>
      </footer>
    </div>
  );
}


