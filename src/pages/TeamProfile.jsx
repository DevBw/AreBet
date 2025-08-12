import React, { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import TabBar from '../components/TabBar.jsx';
import KPIChip from '../components/KPIChip.jsx';
import { useParams } from 'react-router-dom';
import { useTeams } from '../hooks/useTeams';
import { useApi } from '../hooks/useApi';
import { useTeamInjuries } from '../hooks/useInjuries';
import { useTeamTransfers } from '../hooks/useTransfers';
import { useTeamCoach } from '../hooks/useCoaches';
import { apiFootball } from '../services/apiFootball';

export default function TeamProfile() {
  const { teamId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  
  const { data, loading, error } = useTeams({ id: teamId });
  const team = useMemo(() => data?.response?.[0], [data]);
  
  // Multiple seasons data
  const currentSeason = new Date().getFullYear();
  const seasons = [currentSeason, currentSeason - 1, currentSeason - 2];
  
  // Current season data
  const { data: playersData, loading: playersLoading } = useApi(() => (
    teamId ? apiFootball.getTeamPlayers({ team: teamId, season: selectedSeason, page: 1 }) : Promise.resolve(null)
  ), [teamId, selectedSeason]);
  
  const { data: teamStatsData, loading: statsLoading } = useApi(() => (
    teamId ? apiFootball.getTrends({ team: teamId, season: selectedSeason }) : Promise.resolve(null)
  ), [teamId, selectedSeason]);

  // Additional team data
  const { data: injuriesData, loading: injuriesLoading } = useTeamInjuries(teamId, selectedSeason);
  const { data: transfersData, loading: transfersLoading } = useTeamTransfers(teamId);
  const { data: coachData, loading: coachLoading } = useTeamCoach(teamId);

  // Recent matches
  const { data: recentMatchesData, loading: matchesLoading } = useApi(() => (
    teamId ? apiFootball.getMatches({ team: teamId, season: selectedSeason, last: 10 }) : Promise.resolve(null)
  ), [teamId, selectedSeason]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'squad', label: 'Squad' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'history', label: 'History' }
  ];

  const teamStats = useMemo(() => {
    if (!teamStatsData?.response) return null;
    const stats = teamStatsData.response;
    return {
      matchesPlayed: stats.fixtures?.played?.total || 0,
      wins: stats.fixtures?.wins?.total || 0,
      draws: stats.fixtures?.draws?.total || 0,
      losses: stats.fixtures?.loses?.total || 0,
      goalsFor: stats.goals?.for?.total?.total || 0,
      goalsAgainst: stats.goals?.against?.total?.total || 0,
      winPercentage: stats.fixtures?.played?.total > 0 ? 
        Math.round((stats.fixtures?.wins?.total / stats.fixtures?.played?.total) * 100) : 0
    };
  }, [teamStatsData]);

  const isLoading = loading || playersLoading || statsLoading;

  if (error) {
    return (
      <div className="ab-stack">
        <Breadcrumbs items={[{ label: 'Teams', to: '/teams' }, { label: 'Team Profile' }]} />
        <ErrorState title="Team not found" message="The requested team could not be loaded" />
      </div>
    );
  }

  return (
    <div className="ab-stack">
      <Breadcrumbs items={[{ label: 'Teams', to: '/teams' }, { label: team?.team?.name || 'Team Profile' }]} />
      
      {/* Team Header */}
      {isLoading ? (
        <Loader label="Loading team" />
      ) : team ? (
        <Card title="Team Information">
          <div className="team-header">
            <div className="team-basic-info">
              <h1 className="team-name">{team.team?.name}</h1>
              <div className="team-details">
                <div className="team-detail-item">
                  <span className="detail-label">Country:</span>
                  <span className="detail-value">{team.team?.country}</span>
                </div>
                <div className="team-detail-item">
                  <span className="detail-label">Founded:</span>
                  <span className="detail-value">{team.team?.founded || 'Unknown'}</span>
                </div>
                {team.venue && (
                  <>
                    <div className="team-detail-item">
                      <span className="detail-label">Stadium:</span>
                      <span className="detail-value">{team.venue.name}</span>
                    </div>
                    <div className="team-detail-item">
                      <span className="detail-label">Capacity:</span>
                      <span className="detail-value">{team.venue.capacity?.toLocaleString() || 'Unknown'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Season Selector */}
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
          </div>
        </Card>
      ) : (
        <ErrorState title="No team data" message="Team information could not be loaded" />
      )}

      {/* Quick Stats */}
      {teamStats && (
        <Card title={`Season ${selectedSeason} Performance`}>
          <div className="ab-grid-4">
            <KPIChip 
              label="MATCHES" 
              value={teamStats.matchesPlayed} 
              tone="neutral" 
            />
            <KPIChip 
              label="WINS" 
              value={teamStats.wins} 
              tone="positive" 
            />
            <KPIChip 
              label="WIN %" 
              value={`${teamStats.winPercentage}%`} 
              tone="positive" 
            />
            <KPIChip 
              label="GOALS" 
              value={`${teamStats.goalsFor}:${teamStats.goalsAgainst}`} 
              tone="warning" 
            />
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <Card title="Current Season Form">
            {teamStats ? (
              <div className="team-form-grid">
                <div className="form-section">
                  <h4>Results</h4>
                  <div className="results-grid">
                    <div className="result-item">
                      <span className="result-label">Wins:</span>
                      <span className="result-value wins">{teamStats.wins}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Draws:</span>
                      <span className="result-value draws">{teamStats.draws}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Losses:</span>
                      <span className="result-value losses">{teamStats.losses}</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Goals</h4>
                  <div className="goals-stats">
                    <div className="goal-stat">
                      <span>Scored: {teamStats.goalsFor}</span>
                    </div>
                    <div className="goal-stat">
                      <span>Conceded: {teamStats.goalsAgainst}</span>
                    </div>
                    <div className="goal-stat">
                      <span>Difference: {teamStats.goalsFor - teamStats.goalsAgainst}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ab-muted">No form data available</div>
            )}
          </Card>

          {/* Coach Information */}
          <Card title="Coaching Staff">
            {coachLoading ? (
              <Loader label="Loading coach information" />
            ) : coachData?.response?.length > 0 ? (
              <div className="coach-info">
                {coachData.response.slice(0, 3).map((coach) => (
                  <div key={coach.id} className="coach-item">
                    <div className="coach-name">{coach.name}</div>
                    <div className="coach-details">
                      <span>Age: {coach.age || 'Unknown'}</span>
                      <span>Nationality: {coach.nationality || 'Unknown'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ab-muted">No coaching staff information available</div>
            )}
          </Card>

          {/* Stadium Info */}
          {team?.venue && (
            <Card title="Stadium">
              <div className="stadium-info">
                <div className="stadium-details">
                  <h4>{team.venue.name}</h4>
                  <div className="venue-details">
                    <div className="venue-item">
                      <span>City: {team.venue.city}</span>
                    </div>
                    <div className="venue-item">
                      <span>Capacity: {team.venue.capacity?.toLocaleString() || 'Unknown'}</span>
                    </div>
                    <div className="venue-item">
                      <span>Surface: {team.venue.surface || 'Grass'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Squad Tab */}
      {activeTab === 'squad' && (
        <>
          <Card title="Current Squad">
            {playersLoading ? (
              <Loader label="Loading players" />
            ) : playersData?.response ? (
              <div className="players-grid">
                {playersData.response.map((player) => (
                  <div key={player.player?.id} className="player-squad-card">
                    <div className="player-number">{player.statistics?.[0]?.games?.number || '--'}</div>
                    <div className="player-info">
                      <div className="player-name">{player.player?.name}</div>
                      <div className="player-position">{player.statistics?.[0]?.games?.position}</div>
                      <div className="player-age">Age: {player.player?.age}</div>
                    </div>
                    <div className="player-stats">
                      <div className="stat">Apps: {player.statistics?.[0]?.games?.appearences || 0}</div>
                      <div className="stat">Goals: {player.statistics?.[0]?.goals?.total || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ab-muted">No players found</div>
            )}
          </Card>

          {/* Injuries */}
          <Card title="Current Injuries">
            {injuriesLoading ? (
              <Loader label="Loading injury data" />
            ) : injuriesData?.response?.length > 0 ? (
              <div className="injuries-list">
                {injuriesData.response.slice(0, 10).map((injury, index) => (
                  <div key={index} className="injury-item">
                    <div className="injury-player">{injury.player?.name || 'Unknown Player'}</div>
                    <div className="injury-details">
                      <span className="injury-type">{injury.reason || 'Injury'}</span>
                      <span className="injury-date">{injury.date || 'Unknown date'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="success-message">
                ✅ No current injuries reported
              </div>
            )}
          </Card>
        </>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <Card title="Detailed Statistics">
          {teamStatsData?.response ? (
            <div className="detailed-team-stats">
              <div className="stats-sections">
                <div className="stats-section">
                  <h4>Fixtures</h4>
                  <div className="stat-list">
                    <div className="stat-item">
                      <span>Total Played:</span>
                      <span>{teamStatsData.response.fixtures?.played?.total || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span>Home:</span>
                      <span>{teamStatsData.response.fixtures?.played?.home || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span>Away:</span>
                      <span>{teamStatsData.response.fixtures?.played?.away || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="stats-section">
                  <h4>Goals</h4>
                  <div className="stat-list">
                    <div className="stat-item">
                      <span>Goals For:</span>
                      <span>{teamStatsData.response.goals?.for?.total?.total || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span>Goals Against:</span>
                      <span>{teamStatsData.response.goals?.against?.total?.total || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span>Average For:</span>
                      <span>{teamStatsData.response.goals?.for?.average?.total || '0.0'}</span>
                    </div>
                    <div className="stat-item">
                      <span>Average Against:</span>
                      <span>{teamStatsData.response.goals?.against?.average?.total || '0.0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="ab-muted">No detailed statistics available</div>
          )}
        </Card>
      )}

      {/* Transfers Tab */}
      {activeTab === 'transfers' && (
        <Card title="Transfer Activity">
          {transfersLoading ? (
            <Loader label="Loading transfer data" />
          ) : transfersData?.response?.length > 0 ? (
            <div className="transfers-list">
              {transfersData.response.slice(0, 15).map((transfer, index) => (
                <div key={index} className="transfer-item">
                  <div className="transfer-player">{transfer.player?.name || 'Unknown'}</div>
                  <div className="transfer-details">
                    <div className="transfer-direction">
                      {transfer.teams?.out?.name ? (
                        <span>From: {transfer.teams.out.name}</span>
                      ) : (
                        <span>To: {transfer.teams?.in?.name}</span>
                      )}
                    </div>
                    <div className="transfer-info">
                      <span className="transfer-date">{transfer.date || 'Unknown date'}</span>
                      <span className="transfer-type">{transfer.type || 'Transfer'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ab-muted">No transfer activity recorded</div>
          )}
        </Card>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <>
          <Card title="Season History">
            <div className="season-history">
              {seasons.map(season => (
                <div key={season} className="season-item" onClick={() => setSelectedSeason(season)}>
                  <div className="season-year">{season}/{season + 1}</div>
                  <div className="season-status">
                    {season === selectedSeason ? 'Selected' : 'View'}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Team Records">
            <div className="team-records">
              <div className="record-item">
                <div className="record-label">Founded</div>
                <div className="record-value">{team?.team?.founded || 'Unknown'}</div>
              </div>
              <div className="record-item">
                <div className="record-label">Country</div>
                <div className="record-value">{team?.team?.country}</div>
              </div>
              {team?.venue && (
                <div className="record-item">
                  <div className="record-label">Home Stadium</div>
                  <div className="record-value">{team.venue.name}</div>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}


