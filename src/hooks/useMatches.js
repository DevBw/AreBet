import { useApi } from './useApi';
import { apiFootball } from '../services/apiFootball';

export function useLiveMatches() {
  return useApi(() => apiFootball.getLive(), []);
}

export function useFixturesByDate(dateISO) {
  return useApi(() => apiFootball.getFixturesByDate(dateISO), [dateISO]);
}

export function useMatches(params) {
  return useApi(() => apiFootball.getMatches(params ?? {}), [JSON.stringify(params ?? {})]);
}

export function useFixturesRange(fromISO, toISO) {
  return useApi(() => apiFootball.getFixturesRange(fromISO, toISO), [fromISO, toISO]);
}


