import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listApplications } from "@/lib/applications/db";
import { listAllDocuments } from "@/lib/documents/db";
import { ApplicationRow } from "@/components/applications/ApplicationRow";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [applications, resumes, coverLetters] = await Promise.all([
    listApplications(supabase, user.id),
    listAllDocuments(supabase, "resumes", user.id),
    listAllDocuments(supabase, "cover_letters", user.id),
  ]);

  // A closed posting is removed from the active board (not deleted --
  // still shown, just separated out) and the user gets a notification
  // (see lib/ingestion/run.ts's closure logic + lib/notifications/).
  const active = applications.filter((a) => a.job_posting?.status !== "closed");
  const closed = applications.filter((a) => a.job_posting?.status === "closed");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-semibold">Applications</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Active</h2>
        <div className="flex flex-col gap-2">
          {active.map((application) => (
            <ApplicationRow
              key={application.id}
              application={application}
              resumes={resumes}
              coverLetters={coverLetters}
            />
          ))}
          {active.length === 0 && (
            <p className="py-6 text-sm text-muted-foreground">
              No saved jobs yet. Save one from the{" "}
              <Link href="/dashboard/jobs" className="text-primary underline">
                job search
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      {closed.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Closed postings</h2>
          <p className="text-sm text-muted-foreground">
            These postings are no longer available. They&apos;ve been moved out of your active board
            but kept here for your records.
          </p>
          <div className="flex flex-col gap-2">
            {closed.map((application) => (
              <ApplicationRow
                key={application.id}
                application={application}
                resumes={resumes}
                coverLetters={coverLetters}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
