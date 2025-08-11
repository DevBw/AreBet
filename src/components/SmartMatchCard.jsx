import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import KPIChip from './KPIChip.jsx';
import Loader from './Loader.jsx';
import { useApi } from '../hooks/useApi';
import { apiFootball } from '../services/apiFootball';

const MatchTabs = {
  OVERVIEW: 'overview',
  PREDICTIONS: 'predictions', 
  STATS: 'stats',
  H2H: 'h2h'
};

export default function SmartMatchCard({ 
  match, 
  variant = 'default', // 'live', 'upcoming', 'finished'
  showExpanded = false,
  onToggleExpand = null 
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(MatchTabs.OVERVIEW);
  const [isExpanded, setIsExpanded] = useState(showExpanded);
  
  const fixtureId = match?.fixture?.id;
  const homeTeamId = match?.teams?.home?.id;
  const awayTeamId = match?.teams?.away?.id;
  
  // Fetch predictions data
  const { data: predictionsData, loading: predictionsLoading } = useApi(
    () => fixtureId ? apiFootball.getPredictions({ fixture: fixtureId }) : Promise.resolve(null),
    [fixtureId]
  );
  
  // Fetch H2H data
  const { data: h2hData, loading: h2hLoading } = useApi(
    () => homeTeamId && awayTeamId ? apiFootball.getH2H({ home: homeTeamId, away: awayTeamId, last: 5 }) : Promise.resolve(null),
    [homeTeamId, awayTeamId]
  );
  
  // Fetch statistics for finished/live matches
  const { data: statsData, loading: statsLoading } = useApi(
    () => fixtureId && (variant === 'live' || variant === 'finished') 
      ? apiFootball.getStatistics({ fixture: fixtureId, team: homeTeamId }) 
      : Promise.resolve(null),
    [fixtureId, homeTeamId, variant]
  );

  const predictions = useMemo(() => {
    const pred = predictionsData?.response?.[0];
    if (!pred) return null;
    
    return {
      homeWin: pred.predictions?.percent?.home ? parseInt(pred.predictions.percent.home) : null,
      draw: pred.predictions?.percent?.draw ? parseInt(pred.predictions.percent.draw) : null,
      awayWin: pred.predictions?.percent?.away ? parseInt(pred.predictions.percent.away) : null,
      advice: pred.predictions?.advice || null,
      winner: pred.predictions?.winner?.name || null,
      goalsHome: pred.predictions?.goals?.home || null,
      goalsAway: pred.predictions?.goals?.away || null,
      underOver: pred.predictions?.under_over || null
    };
  }, [predictionsData]);

  const h2hRecord = useMemo(() => {
    const matches = h2hData?.response || [];
    if (matches.length === 0) return null;

    const homeWins = matches.filter(m => 
      m.teams?.home?.id === homeTeamId && m.goals?.home > m.goals?.away
    ).length;
    const awayWins = matches.filter(m => 
      m.teams?.away?.id === awayTeamId && m.goals?.away > m.goals?.home
    ).length;
    const draws = matches.filter(m => m.goals?.home === m.goals?.away).length;

    return { homeWins, awayWins, draws, total: matches.length };
  }, [h2hData, homeTeamId, awayTeamId]);

  const matchStats = useMemo(() => {
    if (!statsData?.response?.[0]) return null;
    const stats = statsData.response[0].statistics;
    
    return stats.reduce((acc, stat) => {
      acc[stat.type] = stat.value;
      return acc;
    }, {});
  }, [statsData]);

  const handleToggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (onToggleExpand) onToggleExpand(newExpanded);
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.ab-match-card-toggle') || e.target.closest('.ab-match-tabs')) {
      return; // Don't navigate if clicking expand button or tabs
    }
    navigate(`/match/${fixtureId}`);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusDisplay = () => {
    const status = match?.fixture?.status;
    if (!status) return 'TBD';
    
    if (status.short === 'LIVE' || status.short === '1H' || status.short === '2H') {
      return `${status.elapsed || 0}'`;
    }
    if (status.short === 'FT') return 'FT';
    if (status.short === 'NS') return formatTime(match?.fixture?.date);
    return status.short;
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'live': return 'ab-match-card-live';
      case 'finished': return 'ab-match-card-finished';
      case 'upcoming': return 'ab-match-card-upcoming';
      default: return '';
    }
  };

  const getConfidenceTone = (percentage) => {
    if (percentage >= 70) return 'positive';
    if (percentage >= 50) return 'warning';
    return 'neutral';
  };

  return (
    <div className={`ab-match-card ${getVariantClass()}`} onClick={handleCardClick}>
      {/* Main Card Header */}
      <div className="ab-match-card-header">
        <div className="ab-match-card-league">
          {match?.league?.name}
          {variant === 'live' && (
            <span className="ab-dot-live" aria-hidden="true">●</span>
          )}
        </div>
        <div className="ab-match-card-status">
          {getStatusDisplay()}
        </div>
      </div>

      {/* Teams and Score */}
      <div className="ab-match-card-main">
        <div className="ab-match-teams">
          <div className="ab-match-team ab-match-home">
            <img 
              src={match?.teams?.home?.logo} 
              alt={`${match?.teams?.home?.name} logo`}
              className="ab-team-logo"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="ab-team-name">{match?.teams?.home?.name}</span>
          </div>
          
          <div className="ab-match-score">
            {variant === 'upcoming' ? (
              <span className="ab-match-vs">VS</span>
            ) : (
              <>
                <span className="ab-score-home">{match?.goals?.home || 0}</span>
                <span className="ab-score-separator">:</span>
                <span className="ab-score-away">{match?.goals?.away || 0}</span>
              </>
            )}
          </div>

          <div className="ab-match-team ab-match-away">
            <span className="ab-team-name">{match?.teams?.away?.name}</span>
            <img 
              src={match?.teams?.away?.logo} 
              alt={`${match?.teams?.away?.name} logo`}
              className="ab-team-logo"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Quick Insights Row */}
        <div className="ab-match-insights">
          {predictions && !predictionsLoading && (
            <div className="ab-quick-predictions">
              {predictions.homeWin && (
                <KPIChip 
                  label="HOME" 
                  value={`${predictions.homeWin}%`} 
                  tone={getConfidenceTone(predictions.homeWin)}
                  size="small"
                />
              )}
              {predictions.draw && (
                <KPIChip 
                  label="DRAW" 
                  value={`${predictions.draw}%`} 
                  tone="neutral"
                  size="small"
                />
              )}
              {predictions.awayWin && (
                <KPIChip 
                  label="AWAY" 
                  value={`${predictions.awayWin}%`} 
                  tone={getConfidenceTone(predictions.awayWin)}
                  size="small"
                />
              )}
            </div>
          )}
          
          {predictionsLoading && (
            <Loader label="Loading predictions" size="small" />
          )}
        </div>

        {/* Expand/Collapse Toggle */}
        <button 
          className="ab-match-card-toggle"
          onClick={handleToggleExpand}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Show less details' : 'Show more details'}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="ab-match-card-expanded">
          {/* Tab Navigation */}
          <div className="ab-match-tabs">
            {Object.values(MatchTabs).map(tab => (
              <button
                key={tab}
                className={`ab-tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="ab-match-tab-content">
            {activeTab === MatchTabs.OVERVIEW && (
              <div className="ab-tab-overview">
                <div className="ab-match-details">
                  <div className="ab-detail-item">
                    <span className="ab-detail-label">Venue:</span>
                    <span className="ab-detail-value">
                      {match?.fixture?.venue?.name}, {match?.fixture?.venue?.city}
                    </span>
                  </div>
                  {match?.fixture?.referee && (
                    <div className="ab-detail-item">
                      <span className="ab-detail-label">Referee:</span>
                      <span className="ab-detail-value">{match.fixture.referee}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === MatchTabs.PREDICTIONS && (
              <div className="ab-tab-predictions">
                {predictionsLoading ? (
                  <Loader label="Loading predictions" />
                ) : predictions ? (
                  <div className="ab-predictions-content">
                    <div className="ab-prediction-row">
                      <div className="ab-prediction-item">
                        <KPIChip 
                          label="HOME WIN" 
                          value={`${predictions.homeWin}%`} 
                          tone={getConfidenceTone(predictions.homeWin)}
                        />
                      </div>
                      <div className="ab-prediction-item">
                        <KPIChip 
                          label="DRAW" 
                          value={`${predictions.draw}%`} 
                          tone="neutral"
                        />
                      </div>
                      <div className="ab-prediction-item">
                        <KPIChip 
                          label="AWAY WIN" 
                          value={`${predictions.awayWin}%`} 
                          tone={getConfidenceTone(predictions.awayWin)}
                        />
                      </div>
                    </div>
                    
                    {predictions.advice && (
                      <div className="ab-prediction-advice">
                        <strong>Expert Advice:</strong> {predictions.advice}
                      </div>
                    )}
                    
                    {(predictions.goalsHome || predictions.goalsAway) && (
                      <div className="ab-predicted-score">
                        <strong>Predicted Score:</strong> {predictions.goalsHome}-{predictions.goalsAway}
                      </div>
                    )}
                    
                    {predictions.underOver && (
                      <div className="ab-prediction-detail">
                        <strong>Goals:</strong> {predictions.underOver}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="ab-no-data">No predictions available</div>
                )}
              </div>
            )}

            {activeTab === MatchTabs.STATS && (
              <div className="ab-tab-stats">
                {variant === 'upcoming' ? (
                  <div className="ab-form-comparison">
                    <div className="ab-form-section">
                      <h4>{match?.teams?.home?.name} (Home)</h4>
                      <div className="ab-form-placeholder">Recent form data</div>
                    </div>
                    <div className="ab-form-section">
                      <h4>{match?.teams?.away?.name} (Away)</h4>
                      <div className="ab-form-placeholder">Recent form data</div>
                    </div>
                  </div>
                ) : statsLoading ? (
                  <Loader label="Loading statistics" />
                ) : matchStats ? (
                  <div className="ab-match-statistics">
                    <div className="ab-stats-grid">
                      {Object.entries(matchStats).slice(0, 6).map(([key, value]) => (
                        <div key={key} className="ab-stat-item">
                          <span className="ab-stat-label">{key}</span>
                          <span className="ab-stat-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ab-no-data">No statistics available</div>
                )}
              </div>
            )}

            {activeTab === MatchTabs.H2H && (
              <div className="ab-tab-h2h">
                {h2hLoading ? (
                  <Loader label="Loading head-to-head" />
                ) : h2hRecord ? (
                  <div className="ab-h2h-content">
                    <div className="ab-h2h-summary">
                      <KPIChip 
                        label={`${match?.teams?.home?.name} WINS`}
                        value={h2hRecord.homeWins}
                        tone="positive"
                        size="small"
                      />
                      <KPIChip 
                        label="DRAWS"
                        value={h2hRecord.draws}
                        tone="neutral"
                        size="small"
                      />
                      <KPIChip 
                        label={`${match?.teams?.away?.name} WINS`}
                        value={h2hRecord.awayWins}
                        tone="warning"
                        size="small"
                      />
                    </div>
                    <div className="ab-h2h-note">
                      Last {h2hRecord.total} meetings
                    </div>
                  </div>
                ) : (
                  <div className="ab-no-data">No head-to-head data available</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

