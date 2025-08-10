import { useApi } from './useApi';
import { apiFootball } from '../services/apiFootball';

export function useTeams(params) {
  return useApi(() => apiFootball.getTeams(params ?? {}), [JSON.stringify(params ?? {})]);
}


