import React, { useState, useMemo } from 'react';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import KPIChip from '../components/KPIChip.jsx';
import TabBar from '../components/TabBar.jsx';
import { useLeagues } from '../hooks/useLeagues';
import { useTopDiscipline } from '../hooks/usePlayers';
import { useApi } from '../hooks/useApi';
import { apiFootball } from '../services/apiFootball';

export default function Statistics() {
  const [selectedLeague, setSelectedLeague] = useState('39'); // Premier League default
  const [activeTab, setActiveTab] = useState('players');
  const currentSeason = new Date().getFullYear();
  
  const { data: leaguesData, loading: leaguesLoading } = useLeagues();
  const leagues = useMemo(() => leaguesData?.response?.slice(0, 10) || [], [leaguesData]);
  
  // Top Players Data
  const { data: topScorersData, loading: scorersLoading } = useApi(() => 
    selectedLeague ? apiFootball.getTopScorers({ league: selectedLeague, season: currentSeason }) : Promise.resolve(null),
    [selectedLeague, currentSeason]
  );
  
  const { data: topAssistsData, loading: assistsLoading } = useApi(() => 
    selectedLeague ? apiFootball.getTopAssists({ league: selectedLeague, season: currentSeason }) : Promise.resolve(null),
    [selectedLeague, currentSeason]
  );
  
  // Discipline Data
  const { yellowCards, redCards } = useTopDiscipline(selectedLeague, currentSeason);
  
  // League Standings for additional stats
  const { data: standingsData, loading: standingsLoading } = useApi(() => 
    selectedLeague ? apiFootball.getStandings({ league: selectedLeague, season: currentSeason }) : Promise.resolve(null),
    [selectedLeague, currentSeason]
  );

  const selectedLeagueInfo = useMemo(() => 
    leagues.find(l => String(l.league?.id) === String(selectedLeague)) || leagues[0],
    [leagues, selectedLeague]
  );

  const leagueStats = useMemo(() => {
    if (!standingsData?.response?.[0]?.league?.standings?.[0]) return null;
    
    const standings = standingsData.response[0].league.standings[0];
    const totalGoals = standings.reduce((sum, team) => sum + (team.all?.goals?.for || 0), 0);
    const totalMatches = standings.reduce((sum, team) => sum + (team.all?.played || 0), 0);
    const avgGoalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : 0;
    
    return {
      totalTeams: standings.length,
      totalMatches: totalMatches / 2, // Divide by 2 since each match is counted twice
      totalGoals,
      avgGoalsPerMatch,
      leader: standings[0]?.team?.name || 'N/A'
    };
  }, [standingsData]);

  const tabs = [
    { id: 'players', label: 'Players' },
    { id: 'teams', label: 'Teams' },
    { id: 'league', label: 'League Stats' }
  ];

  const isLoading = leaguesLoading || scorersLoading || assistsLoading || 
                   yellowCards.loading || redCards.loading || standingsLoading;

  return (
    <div className="ab-stack">
      {/* League Selector */}
      <Card title="Statistics Dashboard">
        {leaguesLoading ? (
          <Loader label="Loading leagues" />
        ) : (
          <div className="league-selector">
            <h4>Select League:</h4>
            <select 
              value={selectedLeague} 
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="league-dropdown"
            >
              {leagues.map(league => (
                <option key={league.league?.id} value={league.league?.id}>
                  {league.league?.name} ({league.country?.name})
                </option>
              ))}
            </select>
            {selectedLeagueInfo && (
              <div className="selected-league-info">
                <h3>{selectedLeagueInfo.league?.name}</h3>
                <p className="ab-muted">{selectedLeagueInfo.country?.name} • Season {currentSeason}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* League Overview Stats */}
      {leagueStats && (
        <Card title="League Overview">
          <div className="ab-grid-4">
            <KPIChip label="TEAMS" value={leagueStats.totalTeams} tone="neutral" />
            <KPIChip label="MATCHES" value={leagueStats.totalMatches} tone="positive" />
            <KPIChip label="GOALS" value={leagueStats.totalGoals} tone="warning" />
            <KPIChip label="AVG/MATCH" value={leagueStats.avgGoalsPerMatch} tone="positive" />
          </div>
          <div className="league-leader">
            <strong>League Leader:</strong> {leagueStats.leader}
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Players Tab */}
      {activeTab === 'players' && (
        <>
          <Card title="Top Scorers">
            {isLoading ? (
              <Loader label="Loading top scorers" />
            ) : topScorersData?.response ? (
              <div className="top-players-grid">
                {topScorersData.response.slice(0, 10).map((player, index) => (
                  <div key={player.player?.id} className="player-stat-card">
                    <div className="player-rank">#{index + 1}</div>
                    <div className="player-info">
                      <div className="player-name">{player.player?.name}</div>
                      <div className="player-team">{player.statistics?.[0]?.team?.name}</div>
                    </div>
                    <div className="player-stat">
                      <div className="stat-value">{player.statistics?.[0]?.goals?.total || 0}</div>
                      <div className="stat-label">Goals</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ErrorState title="No scorer data" message="Statistics not available for this league" />
            )}
          </Card>

          <Card title="Top Assists">
            {isLoading ? (
              <Loader label="Loading top assists" />
            ) : topAssistsData?.response ? (
              <div className="top-players-grid">
                {topAssistsData.response.slice(0, 10).map((player, index) => (
                  <div key={player.player?.id} className="player-stat-card">
                    <div className="player-rank">#{index + 1}</div>
                    <div className="player-info">
                      <div className="player-name">{player.player?.name}</div>
                      <div className="player-team">{player.statistics?.[0]?.team?.name}</div>
                    </div>
                    <div className="player-stat">
                      <div className="stat-value">{player.statistics?.[0]?.goals?.assists || 0}</div>
                      <div className="stat-label">Assists</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ErrorState title="No assist data" message="Statistics not available for this league" />
            )}
          </Card>

          <Card title="Discipline">
            <div className="ab-grid-2">
              <div>
                <h4>Most Yellow Cards</h4>
                {yellowCards.loading ? (
                  <Loader label="Loading yellow cards" size="small" />
                ) : yellowCards.data?.response ? (
                  <ul className="ab-list">
                    {yellowCards.data.response.slice(0, 5).map((player) => (
                      <li key={player.player?.id}>
                        {player.player?.name} - {player.statistics?.[0]?.cards?.yellow || 0} cards
                        <span className="ab-muted"> ({player.statistics?.[0]?.team?.name})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="ab-muted">No yellow card data available</div>
                )}
              </div>
              <div>
                <h4>Most Red Cards</h4>
                {redCards.loading ? (
                  <Loader label="Loading red cards" size="small" />
                ) : redCards.data?.response ? (
                  <ul className="ab-list">
                    {redCards.data.response.slice(0, 5).map((player) => (
                      <li key={player.player?.id}>
                        {player.player?.name} - {player.statistics?.[0]?.cards?.red || 0} cards
                        <span className="ab-muted"> ({player.statistics?.[0]?.team?.name})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="ab-muted">No red card data available</div>
                )}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <Card title="Team Standings">
          {standingsLoading ? (
            <Loader label="Loading standings" />
          ) : standingsData?.response?.[0]?.league?.standings?.[0] ? (
            <div className="standings-table">
              <div className="standings-header">
                <div>Pos</div>
                <div>Team</div>
                <div>P</div>
                <div>W</div>
                <div>D</div>
                <div>L</div>
                <div>GF</div>
                <div>GA</div>
                <div>GD</div>
                <div>Pts</div>
              </div>
              {standingsData.response[0].league.standings[0].map((team) => (
                <div key={team.team?.id} className="standings-row">
                  <div className="team-position">{team.rank}</div>
                  <div className="team-name">{team.team?.name}</div>
                  <div>{team.all?.played || 0}</div>
                  <div>{team.all?.win || 0}</div>
                  <div>{team.all?.draw || 0}</div>
                  <div>{team.all?.lose || 0}</div>
                  <div>{team.all?.goals?.for || 0}</div>
                  <div>{team.all?.goals?.against || 0}</div>
                  <div>{team.goalsDiff || 0}</div>
                  <div className="team-points">{team.points || 0}</div>
                </div>
              ))}
            </div>
          ) : (
            <ErrorState title="No standings data" message="Standings not available for this league" />
          )}
        </Card>
      )}

      {/* League Stats Tab */}
      {activeTab === 'league' && (
        <>
          <Card title="Competition Analysis">
            {leagueStats ? (
              <div className="league-analysis">
                <div className="analysis-grid">
                  <div className="analysis-item">
                    <div className="analysis-icon">⚽</div>
                    <div className="analysis-content">
                      <div className="analysis-title">Goals per Match</div>
                      <div className="analysis-value">{leagueStats.avgGoalsPerMatch}</div>
                      <div className="analysis-subtitle">League Average</div>
                    </div>
                  </div>
                  <div className="analysis-item">
                    <div className="analysis-icon">🏆</div>
                    <div className="analysis-content">
                      <div className="analysis-title">Current Leader</div>
                      <div className="analysis-value">{leagueStats.leader}</div>
                      <div className="analysis-subtitle">Top of Table</div>
                    </div>
                  </div>
                  <div className="analysis-item">
                    <div className="analysis-icon">📊</div>
                    <div className="analysis-content">
                      <div className="analysis-title">Total Matches</div>
                      <div className="analysis-value">{leagueStats.totalMatches}</div>
                      <div className="analysis-subtitle">This Season</div>
                    </div>
                  </div>
                  <div className="analysis-item">
                    <div className="analysis-icon">🎯</div>
                    <div className="analysis-content">
                      <div className="analysis-title">Total Goals</div>
                      <div className="analysis-value">{leagueStats.totalGoals}</div>
                      <div className="analysis-subtitle">Season Total</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ErrorState title="No league data" message="Analysis not available for this league" />
            )}
          </Card>

          <Card title="Performance Insights">
            <div className="insights-grid">
              <div className="insight-item">
                <div className="insight-icon">🏠</div>
                <div className="insight-content">
                  <div className="insight-title">Home Advantage</div>
                  <div className="insight-text">
                    Home teams typically perform better with familiar conditions and crowd support
                  </div>
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-icon">📈</div>
                <div className="insight-content">
                  <div className="insight-title">Form Trends</div>
                  <div className="insight-text">
                    Recent form often indicates team momentum and tactical adjustments
                  </div>
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-icon">⏱️</div>
                <div className="insight-content">
                  <div className="insight-title">Match Timing</div>
                  <div className="insight-text">
                    Late goals and substitutions can significantly impact match outcomes
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}


