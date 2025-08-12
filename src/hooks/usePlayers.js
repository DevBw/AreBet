import { useApi } from './useApi';
import { apiFootball } from '../services/apiFootball';

export function usePlayerById(playerId, season) {
  return useApi(() => 
    playerId ? apiFootball.getPlayerById({ id: playerId, season }) : Promise.resolve(null), 
    [playerId, season]
  );
}

export function usePlayerStats(playerId, season, league) {
  return useApi(() => 
    playerId ? apiFootball.getPlayerStats({ id: playerId, season, league }) : Promise.resolve(null), 
    [playerId, season, league]
  );
}

export function usePlayerSeasons(playerId) {
  return useApi(() => 
    playerId ? apiFootball.getPlayerSeasons({ player: playerId }) : Promise.resolve(null), 
    [playerId]
  );
}

export function useSearchPlayers(searchParams = {}) {
  return useApi(() => 
    Object.keys(searchParams).length > 0 ? apiFootball.searchPlayers(searchParams) : Promise.resolve(null), 
    [JSON.stringify(searchParams)]
  );
}

export function useTopDiscipline(leagueId, season) {
  const yellowCardsQuery = useApi(() => 
    leagueId ? apiFootball.getTopYellowCards({ league: leagueId, season }) : Promise.resolve(null), 
    [leagueId, season]
  );
  
  const redCardsQuery = useApi(() => 
    leagueId ? apiFootball.getTopRedCards({ league: leagueId, season }) : Promise.resolve(null), 
    [leagueId, season]
  );

  return {
    yellowCards: yellowCardsQuery,
    redCards: redCardsQuery
  };
}
