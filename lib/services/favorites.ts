import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types.generated";

export type Favorite = Tables<"favorites">;

export type FavoriteInput = {
  entityType: string;
  entityId: string;
  label: string;
  meta?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getFavorites(userId: string): Promise<Favorite[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export async function addFavorite(
  userId: string,
  input: FavoriteInput
): Promise<Favorite> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("favorites")
    .upsert(
      {
        user_id: userId,
        entity_type: input.entityType,
        entity_id: input.entityId,
        label: input.label,
        meta: (input.meta ?? {}) as Favorite["meta"],
      },
      { onConflict: "user_id,entity_type,entity_id" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function removeFavorite(
  userId: string,
  entityType: string,
  entityId: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);

  if (error) throw new Error(error.message);
}

export async function toggleFavorite(
  userId: string,
  input: FavoriteInput,
  currentlyFavorited: boolean
): Promise<{ added: boolean }> {
  if (currentlyFavorited) {
    await removeFavorite(userId, input.entityType, input.entityId);
    return { added: false };
  }
  await addFavorite(userId, input);
  return { added: true };
}
