import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

// Debounce function for search inputs
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function useApi(fetcher, deps = [], options = {}) {
  const {
    debounceMs = 0,
    cacheKey = null,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = false,
    refetchOnReconnect = false
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seq, setSeq] = useState(0);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(0);
  const cacheRef = useRef(new Map());

  // Memoized fetcher to prevent unnecessary re-renders
  const memoizedFetcher = useMemo(() => {
    if (debounceMs > 0) {
      return debounce(fetcher, debounceMs);
    }
    return fetcher;
  }, [fetcher, debounceMs]);

  const refetch = useCallback(() => {
    if (mountedRef.current) {
      setSeq((n) => n + 1);
    }
  }, []);

  // Check if data is stale
  const isStale = useCallback(() => {
    if (!staleTime || !lastFetchRef.current) return true;
    return Date.now() - lastFetchRef.current > staleTime;
  }, [staleTime]);

  // Check cache for data
  const getCachedData = useCallback(() => {
    if (!cacheKey || !cacheRef.current.has(cacheKey)) return null;
    const cached = cacheRef.current.get(cacheKey);
    if (Date.now() - cached.timestamp < staleTime) {
      return cached.data;
    }
    cacheRef.current.delete(cacheKey);
    return null;
  }, [cacheKey, staleTime]);

  // Set cache data
  const setCachedData = useCallback((newData) => {
    if (cacheKey) {
      cacheRef.current.set(cacheKey, {
        data: newData,
        timestamp: Date.now()
      });
      
      // Clean up old cache entries
      if (cacheRef.current.size > 50) {
        const oldestKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(oldestKey);
      }
    }
  }, [cacheKey]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Check cache first
    const cachedData = getCachedData();
    if (cachedData && !isStale()) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await memoizedFetcher();
        if (mountedRef.current) {
          setData(result);
          setCachedData(result);
          lastFetchRef.current = Date.now();
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, [...deps, seq, memoizedFetcher, getCachedData, isStale, setCachedData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;
    
    const handleFocus = () => {
      if (isStale()) {
        refetch();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, isStale, refetch]);

  // Refetch on reconnect
  useEffect(() => {
    if (!refetchOnReconnect) return;
    
    const handleOnline = () => {
      if (isStale()) {
        refetch();
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refetchOnReconnect, isStale, refetch]);

  return { data, loading, error, refetch };
}

export default useApi;


