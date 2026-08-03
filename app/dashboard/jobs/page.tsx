import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listJobPostings } from "@/lib/jobs/db";
import { JobFilterSidebar } from "@/components/jobs/JobFilterSidebar";
import { JobResultRow } from "@/components/jobs/JobResultRow";
import { AccountSummaryStrip } from "@/components/dashboard/AccountSummaryStrip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { JobCategory } from "@/types/database";

const VALID_CATEGORIES: JobCategory[] = [
  "software",
  "data_ml",
  "hardware",
  "biotech",
  "infrastructure_security",
  "other_stem",
];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; remote?: string; category?: string; page?: string }>;
}) {
  const { q, remote, category, page } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const validCategory = VALID_CATEGORIES.includes(category as JobCategory)
    ? (category as JobCategory)
    : undefined;
  const currentPage = Math.max(1, Number(page) || 1);

  const { postings, hasMore } = await listJobPostings(supabase, {
    q,
    remote: remote === "true",
    category: validCategory,
    page: currentPage,
  });

  function pageHref(targetPage: number): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (remote === "true") params.set("remote", "true");
    if (validCategory) params.set("category", validCategory);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/dashboard/jobs?${qs}` : "/dashboard/jobs";
  }

  const postingIds = postings.map((p) => p.id);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Search STEM Jobs</h1>
        <AccountSummaryStrip />
      </div>

      <form className="flex flex-wrap items-center gap-3">
        {validCategory && <input type="hidden" name="category" value={validCategory} />}
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

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <JobFilterSidebar activeCategory={validCategory} q={q} remote={remote === "true"} />

        <Card className="divide-y py-0" data-testid="job-results">
          {postings.map((posting) => (
            <JobResultRow key={posting.id} posting={posting} saved={savedIds.has(posting.id)} />
          ))}
          {postings.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No jobs found. If this is a fresh setup, the ingestion cron hasn&apos;t run yet.
            </p>
          )}
        </Card>

        {(currentPage > 1 || hasMore) && (
          <div className="col-start-2 flex items-center justify-between">
            {currentPage > 1 ? (
              <Link href={pageHref(currentPage - 1)} className="text-sm text-primary hover:underline">
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            {hasMore && (
              <Link href={pageHref(currentPage + 1)} className="text-sm text-primary hover:underline">
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
