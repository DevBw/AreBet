import { useApi } from './useApi';
import { apiFootball } from '../services/apiFootball';

export function useVenues(params = {}) {
  return useApi(() => apiFootball.getVenues(params), [JSON.stringify(params)]);
}

export function useVenueById(venueId) {
  return useApi(() => 
    venueId ? apiFootball.getVenues({ id: venueId }) : Promise.resolve(null), 
    [venueId]
  );
}

export function useVenuesByCity(city) {
  return useApi(() => 
    city ? apiFootball.getVenues({ city }) : Promise.resolve(null), 
    [city]
  );
}

export function useVenuesByCountry(country) {
  return useApi(() => 
    country ? apiFootball.getVenues({ country }) : Promise.resolve(null), 
    [country]
  );
}

export function useSearchVenues(searchTerm) {
  return useApi(() => 
    searchTerm ? apiFootball.getVenues({ search: searchTerm }) : Promise.resolve(null), 
    [searchTerm]
  );
}
