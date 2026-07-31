import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, JobCategory } from "@/types/database";

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  url: string;
  category: JobCategory;
  similarity: number;
}

export async function getResumeEmbeddingState(
  supabase: SupabaseClient<Database>,
  resumeId: string,
): Promise<{ embedding: number[] | null; embedding_source_hash: string | null } | null> {
  const { data, error } = await supabase
    .from("resumes")
    .select("embedding, embedding_source_hash")
    .eq("id", resumeId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateResumeEmbedding(
  supabase: SupabaseClient<Database>,
  resumeId: string,
  embedding: number[],
  sourceHash: string,
): Promise<void> {
  const { error } = await supabase
    .from("resumes")
    .update({ embedding, embedding_source_hash: sourceHash })
    .eq("id", resumeId);
  if (error) throw error;
}

export async function matchJobsForResume(
  supabase: SupabaseClient<Database>,
  embedding: number[],
): Promise<JobMatch[]> {
  const { data, error } = await supabase.rpc("match_jobs_for_resume", {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: 20,
  });
  if (error) throw error;
  return data ?? [];
}
