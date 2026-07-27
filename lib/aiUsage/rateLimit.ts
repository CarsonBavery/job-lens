import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { SubscriptionTier } from "@/lib/documents/db";
import { aiGenerationLimit, countAiGenerationsInWindow } from "./db";

// Checked at the top of every Gemini generate_content call site
// (tailorResume, generateCoverLetter, project GitHub summarization) before
// spending a real API call -- returns an error message to show the user
// instead of throwing, matching how those actions already report failures
// via useActionState.
export async function checkAiRateLimit(
  supabase: SupabaseClient<Database>,
  userId: string,
  tier: SubscriptionTier,
): Promise<string | null> {
  const count = await countAiGenerationsInWindow(supabase, userId);
  const limit = aiGenerationLimit(tier);
  if (count >= limit) {
    const upgradeHint = tier === "free" ? " Upgrade to Pro for a higher limit." : "";
    return `You've reached your ${tier} tier limit of ${limit} AI generations per day.${upgradeHint}`;
  }
  return null;
}
