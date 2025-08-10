import { useEffect, useMemo, useState } from 'react';
import { apiFootball } from '../services/apiFootball';
import { toISODate } from '../utils/date';

export function useHotPicks(limit = 5) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const today = toISODate();
        const fixturesJson = await apiFootball.getFixturesRange(today, today);
        const fixtures = fixturesJson?.response ?? [];
        const ids = fixtures.map((f) => f.fixture?.id).filter(Boolean).slice(0, 8);
        const results = [];
        // Fetch predictions sequentially to be gentle on rate limits
        for (const id of ids) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const predJson = await apiFootball.getPredictions({ fixture: id });
            const pred = predJson?.response?.[0];
            if (pred) {
              results.push({ fixtureId: id, prediction: pred });
            }
            if (results.length >= limit) break;
          } catch (e) {
            // ignore single prediction errors, continue
          }
        }
        if (!cancelled) setData(results);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [limit]);

  const picks = useMemo(() => {
    return data.map((d) => {
      const p = d.prediction?.predictions;
      const advice = p?.advice;
      const home = d.prediction?.teams?.home?.name;
      const away = d.prediction?.teams?.away?.name;
      const percentHome = Number((p?.percent?.home || '0%').replace('%', ''));
      const percentDraw = Number((p?.percent?.draw || '0%').replace('%', ''));
      const percentAway = Number((p?.percent?.away || '0%').replace('%', ''));
      const best = Math.max(percentHome, percentDraw, percentAway);
      const side = best === percentHome ? 'HOME' : best === percentAway ? 'AWAY' : 'DRAW';
      return { fixtureId: d.fixtureId, home, away, advice, percentHome, percentDraw, percentAway, side, best };
    });
  }, [data]);

  return { picks, loading, error };
}

export default useHotPicks;


