import { useApi } from './useApi';
import { apiFootball } from '../services/apiFootball';

export function useTrends(params) {
  return useApi(() => apiFootball.getTrends(params ?? {}), [JSON.stringify(params ?? {})]);
}


