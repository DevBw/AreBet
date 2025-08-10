import { useEffect, useRef, useState, useCallback } from 'react';

export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seq, setSeq] = useState(0);
  const mountedRef = useRef(true);

  const refetch = useCallback(() => setSeq((n) => n + 1), []);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await fetcher();
        if (mountedRef.current) setData(result);
      } catch (err) {
        if (mountedRef.current) setError(err);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, seq]);

  return { data, loading, error, refetch };
}

export default useApi;


