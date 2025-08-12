import { useApi } from './useApi';
import { apiFootball } from '../services/apiFootball';

export function useCoaches(params = {}) {
  return useApi(() => apiFootball.getCoaches(params), [JSON.stringify(params)]);
}

export function useCoachById(coachId) {
  return useApi(() => 
    coachId ? apiFootball.getCoaches({ id: coachId }) : Promise.resolve(null), 
    [coachId]
  );
}

export function useTeamCoach(teamId) {
  return useApi(() => 
    teamId ? apiFootball.getCoaches({ team: teamId }) : Promise.resolve(null), 
    [teamId]
  );
}

export function useSearchCoaches(searchTerm) {
  return useApi(() => 
    searchTerm ? apiFootball.getCoaches({ search: searchTerm }) : Promise.resolve(null), 
    [searchTerm]
  );
}
