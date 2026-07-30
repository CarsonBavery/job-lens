import { createClient } from "@/lib/supabase/server";
import { saveJob } from "@/lib/applications/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const postingIds = (postings ?? []).map((p) => p.id);
  let savedIds = new Set<string>();
  if (user && postingIds.length > 0) {
    const { data: saved } = await supabase
      .from("applications")
      .select("job_posting_id")
      .eq("user_id", user.id)
      .in("job_posting_id", postingIds);
    savedIds = new Set(
      (saved ?? [])
        .map((a) => a.job_posting_id)
        .filter((id): id is string => id !== null),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Jobs</h1>

      <form className="flex flex-wrap items-center gap-3">
        <Input name="q" defaultValue={q ?? ""} placeholder="Search by title or company…" className="flex-1" />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="remote"
            value="true"
            defaultChecked={remote === "true"}
            className="size-5 rounded border-input accent-primary"
          />
          Remote only
        </label>
        <Button type="submit">Search</Button>
      </form>

      <Card className="divide-y py-0" data-testid="job-results">
        {(postings ?? []).map((posting) => (
          <div key={posting.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-col gap-1">
              <a
                href={posting.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                {posting.title}
              </a>
              <p className="text-sm text-muted-foreground">
                {posting.company}
                {posting.location ? ` — ${posting.location}` : ""}
                {posting.remote ? " — Remote" : ""}
              </p>
            </div>
            {savedIds.has(posting.id) ? (
              <span className="shrink-0 text-sm text-muted-foreground">Saved</span>
            ) : (
              <form action={saveJob}>
                <input type="hidden" name="jobPostingId" value={posting.id} />
                <Button type="submit" variant="outline" size="sm" className="shrink-0">
                  Save
                </Button>
              </form>
            )}
          </div>
        ))}
        {(postings ?? []).length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No jobs found. If this is a fresh setup, the ingestion cron hasn&apos;t run yet.
          </p>
        )}
      </Card>
    </div>
  );
}
