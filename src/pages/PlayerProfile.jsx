import React, { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import KPIChip from '../components/KPIChip.jsx';
import TabBar from '../components/TabBar.jsx';
import { useParams } from 'react-router-dom';
import { usePlayerById, usePlayerStats, usePlayerSeasons } from '../hooks/usePlayers';
import { usePlayerInjuries } from '../hooks/useInjuries';
import { usePlayerTransfers } from '../hooks/useTransfers';
import { useApi } from '../hooks/useApi';
import { apiFootball } from '../services/apiFootball';

export default function PlayerProfile() {
  const { playerId } = useParams();
  const currentSeason = new Date().getFullYear();
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const [activeTab, setActiveTab] = useState('overview');

  // Player basic data
  const { data: playerData, loading: playerLoading, error: playerError } = usePlayerById(playerId, selectedSeason);
  const player = useMemo(() => playerData?.response?.[0], [playerData]);

  // Player detailed statistics
  const { data: playerStatsData, loading: statsLoading } = usePlayerStats(playerId, selectedSeason);
  const playerStats = useMemo(() => playerStatsData?.response?.[0]?.statistics?.[0], [playerStatsData]);

  // Player career seasons
  const { data: seasonsData, loading: seasonsLoading } = usePlayerSeasons(playerId);
  const seasons = useMemo(() => seasonsData?.response || [], [seasonsData]);

  // Injury data
  const { data: injuriesData, loading: injuriesLoading } = usePlayerInjuries(playerId);
  const injuries = useMemo(() => injuriesData?.response || [], [injuriesData]);

  // Transfer history
  const { data: transfersData, loading: transfersLoading } = usePlayerTransfers(playerId);
  const transfers = useMemo(() => transfersData?.response || [], [transfersData]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'career', label: 'Career' },
    { id: 'injuries', label: 'Injuries' },
    { id: 'transfers', label: 'Transfers' }
  ];

  const isLoading = playerLoading || statsLoading || seasonsLoading;

  if (playerError) {
    return (
      <div className="ab-stack">
        <Breadcrumbs items={[{ label: 'Players', to: '/players' }, { label: 'Player Profile' }]} />
        <ErrorState title="Player not found" message="The requested player could not be loaded" />
      </div>
    );
  }

  return (
    <div className="ab-stack">
      <Breadcrumbs items={[{ label: 'Players', to: '/players' }, { label: player?.player?.name || 'Player Profile' }]} />
      
      {/* Player Header */}
      {isLoading ? (
        <Loader label="Loading player" />
      ) : player ? (
        <Card title="Player Information">
          <div className="player-header">
            <div className="player-basic-info">
              <h1 className="player-name">{player.player?.name}</h1>
              <div className="player-details">
                <div className="player-detail-item">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{player.player?.age || 'N/A'}</span>
                </div>
                <div className="player-detail-item">
                  <span className="detail-label">Position:</span>
                  <span className="detail-value">{playerStats?.games?.position || 'N/A'}</span>
                </div>
                <div className="player-detail-item">
                  <span className="detail-label">Nationality:</span>
                  <span className="detail-value">{player.player?.nationality || 'N/A'}</span>
                </div>
                <div className="player-detail-item">
                  <span className="detail-label">Height:</span>
                  <span className="detail-value">{player.player?.height || 'N/A'}</span>
                </div>
                <div className="player-detail-item">
                  <span className="detail-label">Weight:</span>
                  <span className="detail-value">{player.player?.weight || 'N/A'}</span>
                </div>
                {playerStats?.team && (
                  <div className="player-detail-item">
                    <span className="detail-label">Current Team:</span>
                    <span className="detail-value">{playerStats.team.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Season Selector */}
            {seasons.length > 0 && (
              <div className="season-selector">
                <label>Season:</label>
                <select 
                  value={selectedSeason} 
                  onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                  className="season-dropdown"
                >
                  {seasons.map(season => (
                    <option key={season} value={season}>
                      {season}/{season + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <ErrorState title="No player data" message="Player information could not be loaded" />
      )}

      {/* Quick Stats */}
      {playerStats && (
        <Card title={`Season ${selectedSeason} Summary`}>
          <div className="ab-grid-4">
            <KPIChip 
              label="GAMES" 
              value={playerStats.games?.appearences || 0} 
              tone="neutral" 
            />
            <KPIChip 
              label="GOALS" 
              value={playerStats.goals?.total || 0} 
              tone="positive" 
            />
            <KPIChip 
              label="ASSISTS" 
              value={playerStats.goals?.assists || 0} 
              tone="warning" 
            />
            <KPIChip 
              label="RATING" 
              value={playerStats.games?.rating ? parseFloat(playerStats.games.rating).toFixed(1) : 'N/A'} 
              tone="positive" 
            />
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Overview Tab */}
      {activeTab === 'overview' && playerStats && (
        <>
          <Card title="Performance Overview">
            <div className="performance-grid">
              <div className="performance-section">
                <h4>Attacking</h4>
                <div className="stat-list">
                  <div className="stat-item">
                    <span>Goals:</span>
                    <span>{playerStats.goals?.total || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span>Assists:</span>
                    <span>{playerStats.goals?.assists || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span>Shots Total:</span>
                    <span>{playerStats.shots?.total || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span>Shots On Target:</span>
                    <span>{playerStats.shots?.on || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="performance-section">
                <h4>Passing</h4>
                <div className="stat-list">
                  <div className="stat-item">
                    <span>Passes Total:</span>
                    <span>{playerStats.passes?.total || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span>Pass Accuracy:</span>
                    <span>{playerStats.passes?.accuracy || 0}%</span>
                  </div>
                  <div className="stat-item">
                    <span>Key Passes:</span>
                    <span>{playerStats.passes?.key || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="performance-section">
                <h4>Defensive</h4>
                <div className="stat-list">
                  <div className="stat-item">
                    <span>Tackles:</span>
                    <span>{playerStats.tackles?.total || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span>Interceptions:</span>
                    <span>{playerStats.tackles?.interceptions || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span>Duels Won:</span>
                    <span>{playerStats.duels?.won || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="performance-section">
                <h4>Discipline</h4>
                <div className="stat-list">
                  <div className="stat-item">
                    <span>Yellow Cards:</span>
                    <span>{playerStats.cards?.yellow || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span>Red Cards:</span>
                    <span>{playerStats.cards?.red || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span>Fouls:</span>
                    <span>{playerStats.fouls?.committed || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && playerStats && (
        <Card title="Detailed Statistics">
          <div className="detailed-stats-grid">
            <div className="stats-category">
              <h4>Games</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Appearances:</span>
                  <span>{playerStats.games?.appearences || 0}</span>
                </div>
                <div className="stat-item">
                  <span>Lineups:</span>
                  <span>{playerStats.games?.lineups || 0}</span>
                </div>
                <div className="stat-item">
                  <span>Minutes:</span>
                  <span>{playerStats.games?.minutes || 0}</span>
                </div>
                <div className="stat-item">
                  <span>Rating:</span>
                  <span>{playerStats.games?.rating ? parseFloat(playerStats.games.rating).toFixed(2) : 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="stats-category">
              <h4>Goals & Assists</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Goals:</span>
                  <span>{playerStats.goals?.total || 0}</span>
                </div>
                <div className="stat-item">
                  <span>Assists:</span>
                  <span>{playerStats.goals?.assists || 0}</span>
                </div>
                <div className="stat-item">
                  <span>Saves:</span>
                  <span>{playerStats.goals?.saves || 0}</span>
                </div>
                <div className="stat-item">
                  <span>Conceded:</span>
                  <span>{playerStats.goals?.conceded || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="stats-category">
              <h4>Shots</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Total Shots:</span>
                  <span>{playerStats.shots?.total || 0}</span>
                </div>
                <div className="stat-item">
                  <span>On Target:</span>
                  <span>{playerStats.shots?.on || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="stats-category">
              <h4>Passing</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Total Passes:</span>
                  <span>{playerStats.passes?.total || 0}</span>
                </div>
                <div className="stat-item">
                  <span>Key Passes:</span>
                  <span>{playerStats.passes?.key || 0}</span>
                </div>
                <div className="stat-item">
                  <span>Accuracy:</span>
                  <span>{playerStats.passes?.accuracy || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Career Tab */}
      {activeTab === 'career' && (
        <Card title="Career History">
          {seasonsLoading ? (
            <Loader label="Loading career data" />
          ) : seasons.length > 0 ? (
            <div className="career-timeline">
              {seasons.map(season => (
                <div key={season} className="career-item">
                  <div className="career-season">{season}/{season + 1}</div>
                  <div className="career-details">
                    Season active
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ErrorState title="No career data" message="Career history not available" />
          )}
        </Card>
      )}

      {/* Injuries Tab */}
      {activeTab === 'injuries' && (
        <Card title="Injury History">
          {injuriesLoading ? (
            <Loader label="Loading injury data" />
          ) : injuries.length > 0 ? (
            <div className="injuries-list">
              {injuries.slice(0, 10).map((injury, index) => (
                <div key={index} className="injury-item">
                  <div className="injury-type">{injury.reason || 'Injury'}</div>
                  <div className="injury-details">
                    <span className="injury-date">{injury.date || 'Unknown date'}</span>
                    {injury.type && <span className="injury-category">{injury.type}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-injuries">
              <div className="success-message">
                ✅ No recent injuries recorded
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Transfers Tab */}
      {activeTab === 'transfers' && (
        <Card title="Transfer History">
          {transfersLoading ? (
            <Loader label="Loading transfer data" />
          ) : transfers.length > 0 ? (
            <div className="transfers-list">
              {transfers.slice(0, 10).map((transfer, index) => (
                <div key={index} className="transfer-item">
                  <div className="transfer-teams">
                    <span className="transfer-from">{transfer.teams?.out?.name || 'Unknown'}</span>
                    <span className="transfer-arrow">→</span>
                    <span className="transfer-to">{transfer.teams?.in?.name || 'Unknown'}</span>
                  </div>
                  <div className="transfer-details">
                    <span className="transfer-date">{transfer.date || 'Unknown date'}</span>
                    <span className="transfer-type">{transfer.type || 'Transfer'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ErrorState title="No transfer data" message="Transfer history not available" />
          )}
        </Card>
      )}
    </div>
  );
}
