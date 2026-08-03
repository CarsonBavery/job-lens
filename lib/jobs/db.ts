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

export interface JobPostingPage {
  postings: JobPostingSummary[];
  hasMore: boolean;
}

export const JOBS_PAGE_SIZE = 25;

// Builds a raw tsquery string (see 0009_job_search_index.sql's search_vector
// column) from free-text user input: strips tsquery's own operator syntax
// so it can't be injected, then ANDs together a prefix match per word --
// "soft eng" -> "soft:* & eng:*" -- so partial words behave like the ILIKE
// search this replaced (e.g. "Soft" still finds "Software").
function buildSearchQuery(term: string): string {
  const cleaned = term
    .replace(/[&|!():*'"<>]/g, " ")
    .trim()
    .slice(0, 100);
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  return tokens.map((token) => `${token}:*`).join(" & ");
}

const SUMMARY_COLUMNS =
  "id, company, title, location, remote, category, salary_min, salary_max, url, posted_at";

export async function listJobPostings(
  supabase: SupabaseClient<Database>,
  params: { q?: string; remote?: boolean; category?: JobCategory; page?: number },
): Promise<JobPostingPage> {
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * JOBS_PAGE_SIZE;
  // Fetch one extra row past the page size so "is there a next page?" is
  // answerable without a separate (expensive, at scale) COUNT(*) query.
  const to = from + JOBS_PAGE_SIZE;

  let query = supabase
    .from("job_postings")
    .select(SUMMARY_COLUMNS)
    .eq("status", "active")
    .order("posted_at", { ascending: false })
    .range(from, to);

  const searchQuery = params.q ? buildSearchQuery(params.q) : "";
  if (searchQuery) {
    query = query.textSearch("search_vector", searchQuery, { config: "english" });
  }
  if (params.remote) {
    query = query.eq("remote", true);
  }
  if (params.category) {
    query = query.eq("category", params.category);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const hasMore = rows.length > JOBS_PAGE_SIZE;
  return { postings: hasMore ? rows.slice(0, JOBS_PAGE_SIZE) : rows, hasMore };
}

export function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  return fmt((min ?? max)!);
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
