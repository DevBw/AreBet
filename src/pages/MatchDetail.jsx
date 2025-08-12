import React, { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import SmartMatchCard from '../components/SmartMatchCard.jsx';
import TabBar from '../components/TabBar.jsx';
import KPIChip from '../components/KPIChip.jsx';
import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { apiFootball } from '../services/apiFootball';
import AnalyticsChart from '../components/AnalyticsChart.jsx';

export default function MatchDetail() {
  const { matchId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data, loading, error } = useApi(() => apiFootball.getFixtureById(matchId), [matchId]);
  const fx = useMemo(() => data?.response?.[0] ?? null, [data]);
  const homeId = fx?.teams?.home?.id;
  const awayId = fx?.teams?.away?.id;
  const fixtureId = fx?.fixture?.id;
  
  // Enhanced data fetching
  const { data: statsData } = useApi(() => (fixtureId ? apiFootball.getStatistics({ fixture: fixtureId, team: homeId }) : Promise.resolve(null)), [fixtureId, homeId]);
  const { data: statsAwayData } = useApi(() => (fixtureId ? apiFootball.getStatistics({ fixture: fixtureId, team: awayId }) : Promise.resolve(null)), [fixtureId, awayId]);
  const { data: lineupsData } = useApi(() => (fixtureId ? apiFootball.getLineups({ fixture: fixtureId }) : Promise.resolve(null)), [fixtureId]);
  const { data: h2hData } = useApi(() => (homeId && awayId ? apiFootball.getH2H({ home: homeId, away: awayId, last: 5 }) : Promise.resolve(null)), [homeId, awayId]);
  const { data: eventsData } = useApi(() => (fixtureId ? apiFootball.getEvents({ fixture: fixtureId }) : Promise.resolve(null)), [fixtureId]);
  const { data: predictionsData } = useApi(() => (fixtureId ? apiFootball.getPredictions({ fixture: fixtureId }) : Promise.resolve(null)), [fixtureId]);
  const { data: playerStatsData } = useApi(() => (fixtureId ? apiFootball.getMatchPlayerStats({ fixture: fixtureId }) : Promise.resolve(null)), [fixtureId]);
  
  // Process statistics for better display
  const homeStats = useMemo(() => statsData?.response?.[0]?.statistics || [], [statsData]);
  const awayStats = useMemo(() => statsAwayData?.response?.[0]?.statistics || [], [statsAwayData]);
  
  // Calculate advanced metrics
  const matchInsights = useMemo(() => {
    if (!homeStats.length || !awayStats.length) return null;
    
    const getStatValue = (stats, type) => {
      const stat = stats.find(s => s.type === type);
      return stat ? (stat.value === null ? 0 : parseInt(stat.value) || 0) : 0;
    };
    
    const homePossession = getStatValue(homeStats, 'Ball Possession');
    const awayPossession = getStatValue(awayStats, 'Ball Possession');
    const homeShotsTotal = getStatValue(homeStats, 'Total Shots');
    const awayShotsTotal = getStatValue(awayStats, 'Total Shots');
    const homeShotsOnTarget = getStatValue(homeStats, 'Shots on Goal');
    const awayShotsOnTarget = getStatValue(awayStats, 'Shots on Goal');
    
    return {
      possession: { home: homePossession, away: awayPossession },
      shots: { home: homeShotsTotal, away: awayShotsTotal },
      shotsOnTarget: { home: homeShotsOnTarget, away: awayShotsOnTarget },
      shotAccuracy: { 
        home: homeShotsTotal > 0 ? Math.round((homeShotsOnTarget / homeShotsTotal) * 100) : 0,
        away: awayShotsTotal > 0 ? Math.round((awayShotsOnTarget / awayShotsTotal) * 100) : 0
      }
    };
  }, [homeStats, awayStats]);
  const getMatchVariant = () => {
    if (!fx?.fixture?.status) return 'upcoming';
    const status = fx.fixture.status.short;
    if (status === 'LIVE' || status === '1H' || status === '2H') return 'live';
    if (status === 'FT') return 'finished';
    return 'upcoming';
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'lineups', label: 'Lineups' },
    { id: 'events', label: 'Events' },
    { id: 'predictions', label: 'Predictions' }
  ];

  return (
    <div className="ab-stack">
      <Breadcrumbs items={[{ label: 'Matches', to: '/matches' }, { label: 'Match Detail' }]} />
      
      {/* Enhanced Match Overview */}
      {loading && <Loader label="Loading match" />}
      {error && <ErrorState title="Could not load match" message="Try again later" />}
      
      {!loading && !error && fx && (
        <>
          <SmartMatchCard 
            match={fx}
            variant={getMatchVariant()}
            showExpanded={true}
          />

          {/* Advanced Match Insights */}
          {matchInsights && (
            <Card title="Match Insights">
              <div className="ab-grid-4">
                <KPIChip 
                  label="HOME POSS" 
                  value={`${matchInsights.possession.home}%`} 
                  tone="neutral" 
                />
                <KPIChip 
                  label="AWAY POSS" 
                  value={`${matchInsights.possession.away}%`} 
                  tone="neutral" 
                />
                <KPIChip 
                  label="HOME SHOTS" 
                  value={matchInsights.shots.home} 
                  tone="positive" 
                />
                <KPIChip 
                  label="AWAY SHOTS" 
                  value={matchInsights.shots.away} 
                  tone="positive" 
                />
              </div>
              <div className="possession-bar">
                <div className="possession-visual">
                  <div 
                    className="possession-home" 
                    style={{ width: `${matchInsights.possession.home}%` }}
                  >
                    {fx.teams?.home?.name} {matchInsights.possession.home}%
                  </div>
                  <div 
                    className="possession-away" 
                    style={{ width: `${matchInsights.possession.away}%` }}
                  >
                    {fx.teams?.away?.name} {matchInsights.possession.away}%
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tab Navigation */}
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <Card title="Match Information">
                <div className="match-info-grid">
                  <div className="info-item">
                    <span className="info-label">Venue:</span>
                    <span className="info-value">{fx.fixture?.venue?.name || 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">City:</span>
                    <span className="info-value">{fx.fixture?.venue?.city || 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date:</span>
                    <span className="info-value">
                      {fx.fixture?.date ? new Date(fx.fixture.date).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className="info-value">{fx.fixture?.status?.long || 'Unknown'}</span>
                  </div>
                </div>
              </Card>

              <Card title="Head to Head">
                {h2hData?.response ? (
                  <div className="h2h-list">
                    {h2hData.response.slice(0, 5).map((match) => (
                      <div key={match.fixture?.id} className="h2h-match">
                        <div className="h2h-date">
                          {new Date(match.fixture?.date).toLocaleDateString()}
                        </div>
                        <div className="h2h-teams">
                          <span className="h2h-home">{match.teams?.home?.name}</span>
                          <span className="h2h-score">
                            {match.goals?.home} - {match.goals?.away}
                          </span>
                          <span className="h2h-away">{match.teams?.away?.name}</span>
                        </div>
                        <div className="h2h-league">{match.league?.name}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ab-muted">No head-to-head data available</div>
                )}
              </Card>
            </>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <Card title="Detailed Statistics">
              {(homeStats.length > 0 || awayStats.length > 0) ? (
                <div className="enhanced-stats-grid">
                  <div className="stats-comparison">
                    <div className="stats-team stats-home">
                      <h4>{fx.teams?.home?.name}</h4>
                      <div className="stats-list">
                        {homeStats.map((stat) => (
                          <div key={stat.type} className="stat-row">
                            <span className="stat-label">{stat.type}:</span>
                            <span className="stat-value">{stat.value || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="stats-vs">VS</div>
                    <div className="stats-team stats-away">
                      <h4>{fx.teams?.away?.name}</h4>
                      <div className="stats-list">
                        {awayStats.map((stat) => (
                          <div key={stat.type} className="stat-row">
                            <span className="stat-label">{stat.type}:</span>
                            <span className="stat-value">{stat.value || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ab-muted">No detailed statistics available</div>
              )}
            </Card>
          )}

          {/* Lineups Tab */}
          {activeTab === 'lineups' && (
            <Card title="Team Lineups">
              {lineupsData?.response ? (
                <div className="lineups-grid">
                  {lineupsData.response.slice(0, 2).map((lineup) => (
                    <div key={lineup.team?.id} className="lineup-section">
                      <div className="lineup-header">
                        <h4>{lineup.team?.name}</h4>
                        <span className="formation">Formation: {lineup.formation}</span>
                      </div>
                      <div className="players-list">
                        <div className="starting-xi">
                          <h5>Starting XI</h5>
                          {lineup.startXI?.map((player) => (
                            <div key={player.player?.id} className="player-item">
                              <span className="player-number">{player.player?.number}</span>
                              <span className="player-name">{player.player?.name}</span>
                              <span className="player-position">{player.player?.pos}</span>
                            </div>
                          ))}
                        </div>
                        <div className="substitutes">
                          <h5>Substitutes</h5>
                          {lineup.substitutes?.slice(0, 7).map((player) => (
                            <div key={player.player?.id} className="player-item substitute">
                              <span className="player-number">{player.player?.number}</span>
                              <span className="player-name">{player.player?.name}</span>
                              <span className="player-position">{player.player?.pos}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ab-muted">No lineup information available</div>
              )}
            </Card>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <>
              <Card title="Match Timeline">
                {eventsData?.response ? (
                  <AnalyticsChart
                    ariaLabel="Match events timeline"
                    labels={eventsData.response.map((e) => `${e.time?.elapsed}'`).slice(0, 30)}
                    series={[{
                      label: 'Event Intensity',
                      data: eventsData.response.map((e) => (e.type === 'Goal' ? 3 : e.type === 'Card' ? 2 : 1)).slice(0, 30),
                    }]}
                  />
                ) : (
                  <div className="ab-muted">No timeline data available</div>
                )}
              </Card>

              <Card title="Events Timeline">
                {eventsData?.response ? (
                  <div className="events-timeline">
                    {eventsData.response.slice(0, 20).map((event, idx) => (
                      <div key={`${event.time?.elapsed}-${idx}`} className="event-item">
                        <div className="event-time">{event.time?.elapsed}'</div>
                        <div className="event-details">
                          <div className="event-type">{event.type}</div>
                          <div className="event-team">{event.team?.name}</div>
                          <div className="event-description">{event.detail}</div>
                          {event.player?.name && (
                            <div className="event-player">{event.player.name}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ab-muted">No events recorded</div>
                )}
              </Card>
            </>
          )}

          {/* Predictions Tab */}
          {activeTab === 'predictions' && (
            <Card title="Match Predictions">
              {predictionsData?.response ? (
                <div className="predictions-content">
                  <div className="prediction-summary">
                    <h4>AI Analysis</h4>
                    <div className="prediction-insights">
                      {predictionsData.response[0]?.predictions?.winner && (
                        <div className="prediction-item">
                          <span className="prediction-label">Predicted Winner:</span>
                          <span className="prediction-value">
                            {predictionsData.response[0].predictions.winner.name}
                          </span>
                        </div>
                      )}
                      {predictionsData.response[0]?.predictions?.percent && (
                        <div className="prediction-percentages">
                          <div className="percentage-item">
                            <span>Home: {predictionsData.response[0].predictions.percent.home}</span>
                          </div>
                          <div className="percentage-item">
                            <span>Draw: {predictionsData.response[0].predictions.percent.draw}</span>
                          </div>
                          <div className="percentage-item">
                            <span>Away: {predictionsData.response[0].predictions.percent.away}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ab-muted">Predictions not available for this match</div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}


