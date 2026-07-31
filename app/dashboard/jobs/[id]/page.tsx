import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getJobPosting } from "@/lib/jobs/db";
import { listBaseDocuments } from "@/lib/documents/db";
import { findApplicationByJobPosting } from "@/lib/applications/db";
import { saveJob } from "@/lib/applications/actions";
import { JobCategoryBadge } from "@/components/jobs/JobCategoryBadge";
import { TailorForJobForm } from "@/components/jobs/TailorForJobForm";
import { GenerateCoverLetterForJobForm } from "@/components/jobs/GenerateCoverLetterForJobForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  return fmt((min ?? max)!);
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // layout already redirects unauthenticated users

  const posting = await getJobPosting(supabase, id);
  if (!posting) notFound();

  const [resumes, existingApplication] = await Promise.all([
    listBaseDocuments(supabase, "resumes", user.id),
    findApplicationByJobPosting(supabase, user.id, id),
  ]);

  const salary = formatSalary(posting.salary_min, posting.salary_max);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/jobs" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to search
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <JobCategoryBadge category={posting.category} />
          {posting.remote && <span className="text-sm text-muted-foreground">Remote</span>}
        </div>
        <h1 className="text-2xl font-semibold">{posting.title}</h1>
        <p className="text-muted-foreground">
          {posting.company}
          {posting.location ? ` — ${posting.location}` : ""}
          {salary ? ` — ${salary}` : ""}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" render={<a href={posting.url} target="_blank" rel="noopener noreferrer" />}>
            View original posting
          </Button>
          {existingApplication ? (
            <span className="flex items-center text-sm text-muted-foreground">Saved</span>
          ) : (
            <form action={saveJob}>
              <input type="hidden" name="jobPostingId" value={posting.id} />
              <Button type="submit" variant="outline">
                Save
              </Button>
            </form>
          )}
        </div>
      </div>

      {posting.description && (
        <Card>
          <CardContent className="whitespace-pre-wrap text-sm">{posting.description}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <TailorForJobForm
          jobPostingId={posting.id}
          hasDescription={!!posting.description}
          resumes={resumes.map((r) => ({ id: r.id, title: r.title }))}
        />
        <GenerateCoverLetterForJobForm
          jobPostingId={posting.id}
          hasDescription={!!posting.description}
          resumes={resumes.map((r) => ({ id: r.id, title: r.title }))}
        />
      </div>
    </div>
  );
}
