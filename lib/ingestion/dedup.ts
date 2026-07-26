import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const EMBEDDING_SIMILARITY_THRESHOLD = 0.9;

// Finds an existing posting this one is a duplicate of, checking an exact
// dedup_key match first (cheap, indexed) and falling back to embedding
// similarity within the same company (catches near-duplicates like "Senior
// Software Engineer" vs "Sr. Software Engineer, Backend"). Returns the
// dedup_group_id to reuse, or null if this posting starts a new group.
export async function resolveDedupGroup(
  supabase: SupabaseClient<Database>,
  params: {
    postingId: string;
    dedupKey: string;
    company: string;
    embedding: number[];
  },
): Promise<string | null> {
  const { data: exactMatch, error: exactError } = await supabase
    .from("job_postings")
    .select("id, dedup_group_id")
    .eq("dedup_key", params.dedupKey)
    .neq("id", params.postingId)
    .limit(1)
    .maybeSingle();
  if (exactError) throw exactError;
  if (exactMatch) return exactMatch.dedup_group_id ?? exactMatch.id;

  const { data: similar, error: similarError } = await supabase.rpc("match_job_postings", {
    query_embedding: params.embedding,
    match_company: params.company,
    match_threshold: EMBEDDING_SIMILARITY_THRESHOLD,
    match_count: 1,
    exclude_id: params.postingId,
  });
  if (similarError) throw similarError;
  const match = similar?.[0];
  if (match) return match.dedup_group_id ?? match.id;

  return null;
}
