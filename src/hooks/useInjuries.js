import { useApi } from './useApi';
import { apiFootball } from '../services/apiFootball';

export function useInjuries(params = {}) {
  return useApi(() => apiFootball.getInjuries(params), [JSON.stringify(params)]);
}

export function usePlayerInjuries(playerId) {
  return useApi(() => 
    playerId ? apiFootball.getInjuries({ player: playerId }) : Promise.resolve(null), 
    [playerId]
  );
}

export function useTeamInjuries(teamId, season) {
  return useApi(() => 
    teamId ? apiFootball.getInjuries({ team: teamId, season }) : Promise.resolve(null), 
    [teamId, season]
  );
}

export function useLeagueInjuries(leagueId, season) {
  return useApi(() => 
    leagueId ? apiFootball.getInjuries({ league: leagueId, season }) : Promise.resolve(null), 
    [leagueId, season]
  );
}
