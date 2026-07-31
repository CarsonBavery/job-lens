import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, JobCategory } from "@/types/database";

export interface JobPostingSummary {
  id: string;
  company: string;
  title: string;
  location: string | null;
  remote: boolean;
  category: JobCategory;
  salary_min: number | null;
  salary_max: number | null;
  url: string;
  posted_at: string | null;
}

export interface JobPostingDetail extends JobPostingSummary {
  description: string | null;
}

// PostgREST's .or() takes a comma-separated filter string, so raw user
// input can't be interpolated into it directly -- a comma or parenthesis in
// the search box would otherwise inject unintended filter clauses. Strip
// anything with syntactic meaning there (or in ILIKE's own %/_ wildcards)
// before building the pattern ourselves.
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()%_]/g, " ").trim().slice(0, 100);
}

const SUMMARY_COLUMNS =
  "id, company, title, location, remote, category, salary_min, salary_max, url, posted_at";

export async function listJobPostings(
  supabase: SupabaseClient<Database>,
  params: { q?: string; remote?: boolean; category?: JobCategory },
): Promise<JobPostingSummary[]> {
  let query = supabase
    .from("job_postings")
    .select(SUMMARY_COLUMNS)
    .eq("status", "active")
    .order("posted_at", { ascending: false })
    .limit(50);

  const cleanQuery = params.q ? sanitizeSearchTerm(params.q) : "";
  if (cleanQuery) {
    query = query.or(`title.ilike.%${cleanQuery}%,company.ilike.%${cleanQuery}%`);
  }
  if (params.remote) {
    query = query.eq("remote", true);
  }
  if (params.category) {
    query = query.eq("category", params.category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getJobPosting(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<JobPostingDetail | null> {
  const { data, error } = await supabase
    .from("job_postings")
    .select(`${SUMMARY_COLUMNS}, description`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
