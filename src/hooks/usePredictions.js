import { useApi } from './useApi';
import { apiFootball } from '../services/apiFootball';

export function usePredictions(params) {
  return useApi(() => apiFootball.getPredictions(params ?? {}), [JSON.stringify(params ?? {})]);
}


