import { useCallback, useEffect, useState } from 'react';
import { listFavorites, toggleFavorite } from '../services/supabase';

export function useFavorites(userId, type) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await listFavorites({ userId, type });
      if (err) throw err;
      setItems(data || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [userId, type]);

  useEffect(() => { load(); }, [load]);

  const isFav = useCallback((id) => items.some((i) => String(i.entity_id) === String(id)), [items]);
  const toggle = useCallback(async (entityId, name) => {
    await toggleFavorite({ userId, type, entityId, name });
    await load();
  }, [userId, type, load]);

  return { items, loading, error, isFav, toggle };
}


