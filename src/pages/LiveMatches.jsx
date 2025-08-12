import React, { useMemo, useState, useEffect } from 'react';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import KPIChip from '../components/KPIChip.jsx';
import SmartMatchCard from '../components/SmartMatchCard.jsx';
import TabBar from '../components/TabBar.jsx';
import { useLiveMatches } from '../hooks/useMatches';
import { useApi } from '../hooks/useApi';
import { apiFootball } from '../services/apiFootball';

export default function LiveMatches() {
  const { data, loading, error, refetch } = useLiveMatches();
  const matches = useMemo(() => data?.response ?? [], [data]);
  const [selectedLeagues, setSelectedLeagues] = useState(new Set());
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState('live');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Live events for selected match
  const { data: liveEventsData, refetch: refetchEvents } = useApi(() => 
    selectedMatch ? apiFootball.getLiveEvents({ fixture: selectedMatch }) : Promise.resolve(null),
    [selectedMatch]
  );

  const { data: liveStatsData, refetch: refetchStats } = useApi(() => 
    selectedMatch ? apiFootball.getLiveStatistics({ fixture: selectedMatch }) : Promise.resolve(null),
    [selectedMatch]
  );

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetch();
      if (selectedMatch) {
        refetchEvents();
        refetchStats();
      }
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch, refetchEvents, refetchStats, selectedMatch, autoRefresh]);

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

  const tabs = [
    { id: 'live', label: 'Live Matches' },
    { id: 'events', label: 'Live Events' },
    { id: 'stats', label: 'Live Stats' }
  ];

  // Get current events and stats
  const liveEvents = useMemo(() => liveEventsData?.response || [], [liveEventsData]);
  const liveStats = useMemo(() => liveStatsData?.response || [], [liveStatsData]);

  const selectedMatchData = useMemo(() => 
    matches.find(m => m.fixture?.id === selectedMatch) || null,
    [matches, selectedMatch]
  );

  return (
    <div className="ab-stack">
      {/* Header Stats */}
      <div className="ab-live-header">
        <div className="ab-live-stats">
          <KPIChip label="LIVE NOW" value={filteredMatches.length} tone="positive" size="large" />
          <KPIChip label="LEAGUES" value={leagues.length} tone="neutral" />
          <KPIChip label="LAST UPDATE" value={formatTime(lastUpdated)} tone="warning" />
          <KPIChip 
            label="AUTO REFRESH" 
            value={autoRefresh ? "ON" : "OFF"} 
            tone={autoRefresh ? "positive" : "neutral"} 
          />
        </div>
        <div className="live-controls">
          <button 
            className={`ab-button ${autoRefresh ? 'active' : ''}`} 
            onClick={() => setAutoRefresh(!autoRefresh)}
            aria-label={`${autoRefresh ? 'Disable' : 'Enable'} auto refresh`}
          >
            {autoRefresh ? '⏸️ Pause' : '▶️ Resume'}
          </button>
          <button className="ab-button" onClick={refetch} aria-label="Refresh live matches">
            🔄 Refresh
          </button>
        </div>
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

      {/* Tab Navigation */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Live Matches Tab */}
      {activeTab === 'live' && (
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
                <div 
                  key={match.fixture?.id}
                  className={`live-match-container ${selectedMatch === match.fixture?.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMatch(match.fixture?.id)}
                >
                  <SmartMatchCard 
                    match={match}
                    variant="live"
                    showExpanded={false}
                  />
                  {selectedMatch === match.fixture?.id && (
                    <div className="selected-indicator">📺 Live Details Active</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Live Events Tab */}
      {activeTab === 'events' && (
        <Card title="Live Events">
          {!selectedMatch ? (
            <div className="select-match-prompt">
              <div className="prompt-icon">📱</div>
              <div className="prompt-title">Select a Live Match</div>
              <div className="prompt-text">
                Click on any live match in the "Live Matches" tab to see real-time events here
              </div>
            </div>
          ) : selectedMatchData ? (
            <>
              <div className="selected-match-header">
                <h3>{selectedMatchData.teams?.home?.name} vs {selectedMatchData.teams?.away?.name}</h3>
                <div className="match-status">
                  {selectedMatchData.fixture?.status?.elapsed}' - {selectedMatchData.fixture?.status?.long}
                </div>
                <div className="current-score">
                  {selectedMatchData.goals?.home || 0} - {selectedMatchData.goals?.away || 0}
                </div>
              </div>
              
              {liveEvents.length > 0 ? (
                <div className="live-events-timeline">
                  {liveEvents.slice().reverse().map((event, index) => (
                    <div key={index} className="live-event-item">
                      <div className="event-time">{event.time?.elapsed}'</div>
                      <div className="event-content">
                        <div className="event-type">{event.type}</div>
                        <div className="event-team">{event.team?.name}</div>
                        <div className="event-player">{event.player?.name}</div>
                        {event.detail && <div className="event-detail">{event.detail}</div>}
                      </div>
                      <div className="event-indicator">🔴</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ab-muted">No live events available for this match</div>
              )}
            </>
          ) : (
            <div className="ab-muted">Selected match not found</div>
          )}
        </Card>
      )}

      {/* Live Stats Tab */}
      {activeTab === 'stats' && (
        <Card title="Live Statistics">
          {!selectedMatch ? (
            <div className="select-match-prompt">
              <div className="prompt-icon">📊</div>
              <div className="prompt-title">Select a Live Match</div>
              <div className="prompt-text">
                Click on any live match in the "Live Matches" tab to see real-time statistics here
              </div>
            </div>
          ) : selectedMatchData ? (
            <>
              <div className="selected-match-header">
                <h3>{selectedMatchData.teams?.home?.name} vs {selectedMatchData.teams?.away?.name}</h3>
                <div className="match-status">
                  {selectedMatchData.fixture?.status?.elapsed}' - {selectedMatchData.fixture?.status?.long}
                </div>
              </div>
              
              {liveStats.length > 0 ? (
                <div className="live-stats-comparison">
                  <div className="stats-teams">
                    <div className="stats-team">
                      <h4>{selectedMatchData.teams?.home?.name}</h4>
                      <div className="team-stats">
                        {liveStats[0]?.statistics?.map((stat, index) => (
                          <div key={index} className="stat-row">
                            <span className="stat-value">{stat.value || 0}</span>
                            <span className="stat-label">{stat.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="stats-vs">LIVE</div>
                    
                    <div className="stats-team">
                      <h4>{selectedMatchData.teams?.away?.name}</h4>
                      <div className="team-stats">
                        {liveStats[1]?.statistics?.map((stat, index) => (
                          <div key={index} className="stat-row">
                            <span className="stat-value">{stat.value || 0}</span>
                            <span className="stat-label">{stat.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ab-muted">No live statistics available for this match</div>
              )}
            </>
          ) : (
            <div className="ab-muted">Selected match not found</div>
          )}
        </Card>
      )}
    </div>
  );
}


