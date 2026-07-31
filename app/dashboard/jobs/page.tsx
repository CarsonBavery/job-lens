import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listJobPostings } from "@/lib/jobs/db";
import { saveJob } from "@/lib/applications/actions";
import { JobCategoryBadge } from "@/components/jobs/JobCategoryBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { JobCategory } from "@/types/database";

const CATEGORY_OPTIONS: { value: JobCategory; label: string }[] = [
  { value: "software", label: "Software" },
  { value: "data_ml", label: "Data / ML" },
  { value: "hardware", label: "Hardware" },
  { value: "biotech", label: "Biotech" },
  { value: "infrastructure_security", label: "Infra / Security" },
  { value: "other_stem", label: "Other STEM" },
];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; remote?: string; category?: string }>;
}) {
  const { q, remote, category } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const validCategory = CATEGORY_OPTIONS.some((c) => c.value === category)
    ? (category as JobCategory)
    : undefined;

  const postings = await listJobPostings(supabase, {
    q,
    remote: remote === "true",
    category: validCategory,
  });

  function categoryHref(category?: JobCategory): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (remote === "true") params.set("remote", "true");
    if (category) params.set("category", category);
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
      <h1 className="text-2xl font-semibold">Search STEM Jobs</h1>

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

      <div className="flex flex-wrap gap-2" data-testid="category-filter">
        <Link
          href={categoryHref()}
          className={`text-sm ${!validCategory ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          All categories
        </Link>
        {CATEGORY_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={categoryHref(opt.value)}
            className={`text-sm ${validCategory === opt.value ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <Card className="divide-y py-0" data-testid="job-results">
        {postings.map((posting) => (
          <div key={posting.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-col gap-1">
              <Link href={`/dashboard/jobs/${posting.id}`} className="font-medium hover:underline">
                {posting.title}
              </Link>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <JobCategoryBadge category={posting.category} />
                <span>
                  {posting.company}
                  {posting.location ? ` — ${posting.location}` : ""}
                  {posting.remote ? " — Remote" : ""}
                </span>
              </div>
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
        {postings.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No jobs found. If this is a fresh setup, the ingestion cron hasn&apos;t run yet.
          </p>
        )}
      </Card>
    </div>
  );
}
