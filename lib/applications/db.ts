import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, JobCategory } from "@/types/database";

export type ApplicationStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected";

export interface ApplicationRecord {
  id: string;
  user_id: string;
  job_posting_id: string | null;
  resume_id: string | null;
  cover_letter_id: string | null;
  status: ApplicationStatus;
  applied_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Embedded via the real job_posting_id FK -- our hand-written Database
  // type doesn't declare Relationships for this join, so the result is
  // cast rather than inferred (same reasoning as lib/documents/db.ts's
  // existing casts).
  job_posting: {
    title: string;
    company: string;
    url: string;
    status: "active" | "closed";
    category: JobCategory;
  } | null;
}

export async function listApplications(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ApplicationRecord[]> {
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, user_id, job_posting_id, resume_id, cover_letter_id, status, applied_at, notes, created_at, updated_at, job_posting:job_postings(title, company, url, status, category)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ApplicationRecord[];
}

export async function findApplicationByJobPosting(
  supabase: SupabaseClient<Database>,
  userId: string,
  jobPostingId: string,
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", userId)
    .eq("job_posting_id", jobPostingId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createApplication(
  supabase: SupabaseClient<Database>,
  userId: string,
  jobPostingId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("applications")
    .insert({ user_id: userId, job_posting_id: jobPostingId, status: "saved" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateApplication(
  supabase: SupabaseClient<Database>,
  id: string,
  fields: Partial<{
    status: ApplicationStatus;
    resume_id: string | null;
    cover_letter_id: string | null;
    notes: string | null;
    applied_at: string | null;
  }>,
): Promise<void> {
  const { error } = await supabase.from("applications").update(fields).eq("id", id);
  if (error) throw error;
}

export async function deleteApplication(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw error;
}

// Used by lib/ingestion/run.ts (service-role client) to find which users'
// saved/applied jobs just closed, so they can be notified.
export async function listApplicationsForJobPostings(
  supabase: SupabaseClient<Database>,
  jobPostingIds: string[],
): Promise<{ id: string; user_id: string; job_posting_id: string | null }[]> {
  if (jobPostingIds.length === 0) return [];
  const { data, error } = await supabase
    .from("applications")
    .select("id, user_id, job_posting_id")
    .in("job_posting_id", jobPostingIds);
  if (error) throw error;
  return data ?? [];
}
