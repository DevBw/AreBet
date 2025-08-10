import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '');

export default supabase;

export async function toggleFavorite({ userId, type, entityId, name }) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  const { data: existing } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('entity_id', String(entityId))
    .maybeSingle();
  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    return { removed: true };
  }
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, type, entity_id: String(entityId), name })
    .select();
  return { data, error };
}

export async function listFavorites({ userId, type }) {
  const { data, error } = await supabase.from('favorites').select('*').eq('user_id', userId).eq('type', type);
  return { data, error };
}


