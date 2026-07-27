import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { SubscriptionTier } from "@/lib/documents/db";

// Placeholder numbers -- easy to retune from one place once real usage
// data exists. At ~$0.01/generate_content call, even the free-tier cap
// costs at most ~$0.10/user/day.
const AI_GENERATION_LIMITS: Record<SubscriptionTier, number> = {
  free: 10,
  pro: 100,
};

export function aiGenerationLimit(tier: SubscriptionTier): number {
  return AI_GENERATION_LIMITS[tier];
}

const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function countAiGenerationsInWindow(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await supabase
    .from("ai_generation_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);
  if (error) throw error;
  return count ?? 0;
}

export async function recordAiGeneration(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from("ai_generation_events").insert({ user_id: userId });
  if (error) throw error;
}
