import { createClient } from "@/lib/supabase/server";

// PostgREST's .or() takes a comma-separated filter string, so raw user
// input can't be interpolated into it directly -- a comma or parenthesis in
// the search box would otherwise inject unintended filter clauses. Strip
// anything with syntactic meaning there (or in ILIKE's own %/_ wildcards)
// before building the pattern ourselves.
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()%_]/g, " ").trim().slice(0, 100);
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; remote?: string }>;
}) {
  const { q, remote } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("job_postings")
    .select("id, company, title, location, remote, url, posted_at")
    .eq("status", "active")
    .order("posted_at", { ascending: false })
    .limit(50);

  const cleanQuery = q ? sanitizeSearchTerm(q) : "";
  if (cleanQuery) {
    query = query.or(`title.ilike.%${cleanQuery}%,company.ilike.%${cleanQuery}%`);
  }
  if (remote === "true") {
    query = query.eq("remote", true);
  }

  const { data: postings, error } = await query;
  if (error) throw error;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Jobs</h1>

      <form className="flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by title or company…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="remote" value="true" defaultChecked={remote === "true"} />
          Remote only
        </label>
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Search
        </button>
      </form>

      <ul
        data-testid="job-results"
        className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800"
      >
        {(postings ?? []).map((posting) => (
          <li key={posting.id} className="flex flex-col gap-1 py-3">
            <a
              href={posting.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              {posting.title}
            </a>
            <p className="text-sm text-gray-500">
              {posting.company}
              {posting.location ? ` — ${posting.location}` : ""}
              {posting.remote ? " — Remote" : ""}
            </p>
          </li>
        ))}
        {(postings ?? []).length === 0 && (
          <p className="py-6 text-sm text-gray-500">
            No jobs found. If this is a fresh setup, the ingestion cron hasn&apos;t run yet.
          </p>
        )}
      </ul>
    </div>
  );
}
