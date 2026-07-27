import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { SubscriptionTier } from "@/lib/documents/db";

export interface ProjectRecord {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tech_stack: string | null;
  github_url: string | null;
  created_at: string;
  updated_at: string;
}

// Matches the resume limit exactly (see PROGRESS.md's Phase 5 backlog) --
// kept separate from lib/documents/db.ts's BASE_LIMITS since projects don't
// share that module's base/tailored-document model.
const PROJECT_LIMITS: Record<SubscriptionTier, number> = {
  free: 3,
  pro: 25,
};

export function projectLimit(tier: SubscriptionTier): number {
  return PROJECT_LIMITS[tier];
}

export async function countProjects(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count ?? 0;
}

export async function listProjects(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ProjectRecord[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, user_id, title, description, tech_stack, github_url, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function insertProject(
  supabase: SupabaseClient<Database>,
  fields: {
    user_id: string;
    title: string;
    description: string | null;
    tech_stack: string | null;
    github_url: string | null;
  },
): Promise<string> {
  const { data, error } = await supabase.from("projects").insert(fields).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function updateProject(
  supabase: SupabaseClient<Database>,
  id: string,
  fields: Partial<{
    title: string;
    description: string | null;
    tech_stack: string | null;
    github_url: string | null;
  }>,
): Promise<void> {
  const { error } = await supabase.from("projects").update(fields).eq("id", id);
  if (error) throw error;
}

export async function deleteProject(supabase: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
