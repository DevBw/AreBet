import { useApi } from './useApi';
import { apiFootball } from '../services/apiFootball';

export function useStatistics(params) {
  return useApi(() => apiFootball.getStatistics(params ?? {}), [JSON.stringify(params ?? {})]);
}


