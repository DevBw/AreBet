import React, { useMemo, useState, useEffect } from 'react';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import KPIChip from '../components/KPIChip.jsx';
import { useLiveMatches } from '../hooks/useMatches';

export default function LiveMatches() {
  const { data, loading, error, refetch } = useLiveMatches();
  const matches = useMemo(() => data?.response ?? [], [data]);
  const [selectedLeagues, setSelectedLeagues] = useState(new Set());
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Get unique leagues from matches
  const leagues = useMemo(() => {
    const leagueSet = new Set();
    matches.forEach(match => {
      if (match.league?.name) {
        leagueSet.add(match.league.name);
      }
    });
    return Array.from(leagueSet);
  }, [matches]);

  // Filter matches by selected leagues
  const filteredMatches = useMemo(() => {
    if (selectedLeagues.size === 0) return matches;
    return matches.filter(match => 
      selectedLeagues.has(match.league?.name)
    );
  }, [matches, selectedLeagues]);

  const toggleLeague = (leagueName) => {
    const newSelected = new Set(selectedLeagues);
    if (newSelected.has(leagueName)) {
      newSelected.delete(leagueName);
    } else {
      newSelected.add(leagueName);
    }
    setSelectedLeagues(newSelected);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="ab-stack">
      {/* Header Stats */}
      <div className="ab-live-header">
        <div className="ab-live-stats">
          <KPIChip label="LIVE NOW" value={filteredMatches.length} tone="positive" size="large" />
          <KPIChip label="LEAGUES" value={leagues.length} tone="neutral" />
          <KPIChip label="LAST UPDATE" value={formatTime(lastUpdated)} tone="warning" />
        </div>
        <button className="ab-button" onClick={refetch} aria-label="Refresh live matches">
          Refresh
        </button>
      </div>

      {/* League Filters */}
      <Card title="League Filters">
        <div className="ab-league-filters">
          <div className="ab-chip-row">
            <button 
              className={`ab-chip ${selectedLeagues.size === 0 ? 'ab-chip-active' : ''}`}
              onClick={() => setSelectedLeagues(new Set())}
              aria-pressed={selectedLeagues.size === 0}
            >
              ALL LEAGUES
            </button>
            {leagues.slice(0, 8).map((league) => (
              <button
                key={league}
                className={`ab-chip ${selectedLeagues.has(league) ? 'ab-chip-active' : ''}`}
                onClick={() => toggleLeague(league)}
                aria-pressed={selectedLeagues.has(league)}
                title={`Filter by ${league}`}
              >
                {league}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Live Matches */}
      <Card title="Live Now" footer={
        <div className="ab-live-footer">
          <span className="ab-live-indicator" aria-live="polite">
            Last updated: {formatTime(lastUpdated)}
          </span>
        </div>
      }>
        {loading && <Loader label="Loading live matches" size="large" />}
        {error && <ErrorState title="No matches right now" message="Try again later" icon="⚽" />}
        {!loading && !error && filteredMatches.length === 0 && (
          <ErrorState 
            title="No live matches" 
            message={selectedLeagues.size > 0 ? "No matches in selected leagues" : "All matches are finished or not started yet"} 
            icon="🏟️" 
          />
        )}
        {!loading && !error && filteredMatches.length > 0 && (
          <div className="ab-live-matches" aria-live="polite">
            {filteredMatches.map((match) => (
              <div key={match.fixture?.id} className="ab-live-match">
                <div className="ab-live-match-header">
                  <span className="ab-live-match-league">{match.league?.name}</span>
                  <span className="ab-live-match-time">{match.fixture?.status?.elapsed}'</span>
                </div>
                <div className="ab-live-match-content">
                  <div className="ab-live-match-teams">
                    <span className="ab-live-match-team ab-live-match-home">
                      {match.teams?.home?.name}
                    </span>
                    <span className="ab-live-match-vs">vs</span>
                    <span className="ab-live-match-team ab-live-match-away">
                      {match.teams?.away?.name}
                    </span>
                  </div>
                  <div className="ab-live-match-score">
                    <span className="ab-live-match-goals">{match.goals?.home || 0}</span>
                    <span className="ab-live-match-separator">:</span>
                    <span className="ab-live-match-goals">{match.goals?.away || 0}</span>
                  </div>
                </div>
                <div className="ab-live-match-status">
                  <span className="ab-dot-live" aria-hidden="true">●</span>
                  <span>LIVE</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


