import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types.generated";
import { DEFAULT_PREFERENCES, type LocalPreferences } from "@/lib/storage/stickiness";

export type UserPreferences = Tables<"user_preferences">;

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getPreferences(userId: string): Promise<LocalPreferences> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return { ...DEFAULT_PREFERENCES };

  return {
    density: data.density,
    default_sort: data.default_sort,
    default_filter_status: data.default_filter_status,
    show_favorites_first: data.show_favorites_first,
    hide_finished: data.hide_finished,
    odds_format: data.odds_format,
  };
}

// ---------------------------------------------------------------------------
// Write (upsert)
// ---------------------------------------------------------------------------

export async function updatePreferences(
  userId: string,
  partial: Partial<LocalPreferences>
): Promise<LocalPreferences> {
  const supabase = createClient();

  // Fetch existing to merge
  const current = await getPreferences(userId);
  const merged = { ...current, ...partial };

  const { data, error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: userId,
        density: merged.density,
        default_sort: merged.default_sort,
        default_filter_status: merged.default_filter_status,
        show_favorites_first: merged.show_favorites_first,
        hide_finished: merged.hide_finished,
        odds_format: merged.odds_format,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    density: data.density,
    default_sort: data.default_sort,
    default_filter_status: data.default_filter_status,
    show_favorites_first: data.show_favorites_first,
    hide_finished: data.hide_finished,
    odds_format: data.odds_format,
  };
}
