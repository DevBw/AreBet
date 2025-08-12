import { useApi } from './useApi';
import { apiFootball } from '../services/apiFootball';

export function useTransfers(params = {}) {
  return useApi(() => apiFootball.getTransfers(params), [JSON.stringify(params)]);
}

export function usePlayerTransfers(playerId) {
  return useApi(() => 
    playerId ? apiFootball.getTransfers({ player: playerId }) : Promise.resolve(null), 
    [playerId]
  );
}

export function useTeamTransfers(teamId) {
  return useApi(() => 
    teamId ? apiFootball.getTransfers({ team: teamId }) : Promise.resolve(null), 
    [teamId]
  );
}
