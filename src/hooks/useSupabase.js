import { useMemo } from 'react';
import { supabase } from '../services/supabase';

export function useSupabase() {
  return useMemo(() => supabase, []);
}


