import Link from "next/link";
import { formatSalary, type JobPostingSummary } from "@/lib/jobs/db";
import { saveJob } from "@/lib/applications/actions";
import { JobCategoryBadge } from "@/components/jobs/JobCategoryBadge";
import { Button } from "@/components/ui/button";

const postedDateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function JobResultRow({
  posting,
  saved,
}: {
  posting: JobPostingSummary;
  saved: boolean;
}) {
  const salary = formatSalary(posting.salary_min, posting.salary_max);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/jobs/${posting.id}`} className="font-medium hover:underline">
            {posting.title}
          </Link>
          <JobCategoryBadge category={posting.category} />
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          {posting.company}
          {posting.location ? ` · ${posting.location}` : ""}
          {posting.remote ? " · Remote" : ""}
          {salary ? ` · ${salary}` : ""}
          {posting.posted_at ? ` · ${postedDateFormat.format(new Date(posting.posted_at))}` : ""}
        </p>
      </div>
      {saved ? (
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
  );
}
