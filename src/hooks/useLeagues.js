import { useApi } from './useApi';
import { apiFootball } from '../services/apiFootball';

export function useLeagues() {
  return useApi(() => apiFootball.getLeagues(), []);
}


