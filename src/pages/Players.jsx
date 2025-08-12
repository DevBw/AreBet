import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import KPIChip from '../components/KPIChip.jsx';
import { useSearchPlayers } from '../hooks/usePlayers';
import { useLeagues } from '../hooks/useLeagues';
import { useTeams } from '../hooks/useTeams';

export default function Players() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const currentSeason = new Date().getFullYear();

  const { data: leaguesData } = useLeagues();
  const leagues = useMemo(() => leaguesData?.response?.slice(0, 20) || [], [leaguesData]);

  const { data: teamsData } = useTeams({ league: selectedLeague, season: currentSeason });
  const teams = useMemo(() => teamsData?.response || [], [teamsData]);

  const searchParams = useMemo(() => {
    const params = { season: currentSeason };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (selectedLeague) params.league = selectedLeague;
    if (selectedTeam) params.team = selectedTeam;
    return Object.keys(params).length > 1 ? params : {};
  }, [searchTerm, selectedLeague, selectedTeam, currentSeason]);

  const { data: playersData, loading: playersLoading } = useSearchPlayers(searchParams);

  const players = useMemo(() => {
    return playersData?.response || [];
  }, [playersData]);

  const handleSearch = () => {
    setIsSearching(true);
    // The search is handled by the hook automatically when searchParams change
    setTimeout(() => setIsSearching(false), 1000);
  };

  const handlePlayerClick = (playerId) => {
    navigate(`/player/${playerId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLeague('');
    setSelectedTeam('');
  };

  return (
    <div className="ab-stack">
      <Card title="Player Search">
        <div className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Search players by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="search-button">
              Search
            </button>
          </div>
          
          <div className="filters-row">
            <div className="filter-group">
              <label>League:</label>
              <select 
                value={selectedLeague} 
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="filter-select"
              >
                <option value="">All Leagues</option>
                {leagues.map(league => (
                  <option key={league.league?.id} value={league.league?.id}>
                    {league.league?.name} ({league.country?.name})
                  </option>
                ))}
              </select>
            </div>

            {selectedLeague && (
              <div className="filter-group">
                <label>Team:</label>
                <select 
                  value={selectedTeam} 
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Teams</option>
                  {teams.map(team => (
                    <option key={team.team?.id} value={team.team?.id}>
                      {team.team?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={clearFilters} className="clear-button">
              Clear Filters
            </button>
          </div>
        </div>
      </Card>

      {/* Search Statistics */}
      {players.length > 0 && (
        <Card title="Search Results">
          <div className="ab-grid-3">
            <KPIChip label="FOUND" value={players.length} tone="positive" />
            <KPIChip label="SEASON" value={currentSeason} tone="neutral" />
            <KPIChip label="ACTIVE" value={players.filter(p => p.statistics?.[0]?.games?.appearences > 0).length} tone="warning" />
          </div>
        </Card>
      )}

      {/* Player Results */}
      <Card title="Players">
        {(playersLoading || isSearching) ? (
          <Loader label="Searching players..." />
        ) : players.length > 0 ? (
          <div className="players-grid">
            {players.map((player) => {
              const stats = player.statistics?.[0];
              return (
                <div 
                  key={player.player?.id} 
                  className="player-card" 
                  onClick={() => handlePlayerClick(player.player?.id)}
                >
                  <div className="player-card-header">
                    <div className="player-name">{player.player?.name}</div>
                    <div className="player-age">Age: {player.player?.age || 'N/A'}</div>
                  </div>
                  
                  <div className="player-card-info">
                    <div className="player-position">{stats?.games?.position || 'Unknown'}</div>
                    <div className="player-team">{stats?.team?.name || 'No Team'}</div>
                    <div className="player-nationality">{player.player?.nationality || 'Unknown'}</div>
                  </div>
                  
                  {stats && (
                    <div className="player-card-stats">
                      <div className="stat-item">
                        <span className="stat-label">Apps:</span>
                        <span className="stat-value">{stats.games?.appearences || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Goals:</span>
                        <span className="stat-value">{stats.goals?.total || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Assists:</span>
                        <span className="stat-value">{stats.goals?.assists || 0}</span>
                      </div>
                      {stats.games?.rating && (
                        <div className="stat-item">
                          <span className="stat-label">Rating:</span>
                          <span className="stat-value">{parseFloat(stats.games.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="player-card-footer">
                    <span className="click-hint">Click for details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : searchParams && Object.keys(searchParams).length > 0 ? (
          <ErrorState 
            title="No players found" 
            message="Try adjusting your search criteria" 
          />
        ) : (
          <div className="search-prompt">
            <div className="search-prompt-icon">🔍</div>
            <div className="search-prompt-title">Search for Players</div>
            <div className="search-prompt-text">
              Enter a player name or select filters to start searching
            </div>
          </div>
        )}
      </Card>

      {/* Featured Players */}
      <Card title="Popular Searches">
        <div className="featured-searches">
          <div className="featured-search-grid">
            {[
              { name: 'Erling Haaland', position: 'Forward' },
              { name: 'Kylian Mbappe', position: 'Forward' },
              { name: 'Kevin De Bruyne', position: 'Midfielder' },
              { name: 'Virgil van Dijk', position: 'Defender' },
              { name: 'Mohamed Salah', position: 'Forward' },
              { name: 'Luka Modric', position: 'Midfielder' }
            ].map((player, index) => (
              <div 
                key={index} 
                className="featured-player-suggestion"
                onClick={() => setSearchTerm(player.name)}
              >
                <div className="suggestion-name">{player.name}</div>
                <div className="suggestion-position">{player.position}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
