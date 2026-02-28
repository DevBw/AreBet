import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types.generated";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "public-anon-key-placeholder";

  return createBrowserClient<Database>(url, anonKey);
}
