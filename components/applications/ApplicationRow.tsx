import type { ApplicationRecord, ApplicationStatus } from "@/lib/applications/db";
import type { DocumentRecord } from "@/lib/documents/db";
import { updateApplicationAction, deleteApplicationAction } from "@/lib/applications/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button";

const STATUSES: ApplicationStatus[] = ["saved", "applied", "interviewing", "offer", "rejected"];

const selectClass =
  "mt-1 block h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function ApplicationRow({
  application,
  resumes,
  coverLetters,
}: {
  application: ApplicationRecord;
  resumes: DocumentRecord[];
  coverLetters: DocumentRecord[];
}) {
  const posting = application.job_posting;

  return (
    <Card className="py-0">
      <details>
        <summary className="flex cursor-pointer flex-wrap items-center gap-2 p-4">
          <span className="font-medium">{posting?.title ?? "(job posting removed)"}</span>
          {posting?.company && (
            <span className="text-sm text-muted-foreground">{posting.company}</span>
          )}
          <Badge variant="secondary" className="capitalize">
            {application.status}
          </Badge>
          {posting?.status === "closed" && <Badge variant="outline">Posting closed</Badge>}
        </summary>

        <CardContent className="flex flex-col gap-3 pb-4">
          {posting?.url && (
            <a
              href={posting.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View posting
            </a>
          )}

          <form action={updateApplicationAction} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={application.id} />
            <input type="hidden" name="currentAppliedAt" value={application.applied_at ?? ""} />

            <div>
              <Label htmlFor={`status-${application.id}`}>Status</Label>
              <select
                id={`status-${application.id}`}
                name="status"
                defaultValue={application.status}
                className={selectClass}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor={`resume-${application.id}`}>Resume used</Label>
              <select
                id={`resume-${application.id}`}
                name="resumeId"
                defaultValue={application.resume_id ?? ""}
                className={selectClass}
              >
                <option value="">— none —</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor={`cover-letter-${application.id}`}>Cover letter used</Label>
              <select
                id={`cover-letter-${application.id}`}
                name="coverLetterId"
                defaultValue={application.cover_letter_id ?? ""}
                className={selectClass}
              >
                <option value="">— none —</option>
                {coverLetters.map((coverLetter) => (
                  <option key={coverLetter.id} value={coverLetter.id}>
                    {coverLetter.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor={`notes-${application.id}`}>Notes</Label>
              <Textarea
                id={`notes-${application.id}`}
                name="notes"
                defaultValue={application.notes ?? ""}
                rows={2}
                className="mt-1"
              />
            </div>

            <Button type="submit" size="sm" className="self-start">
              Save
            </Button>
          </form>

          <form id={`delete-application-${application.id}`} action={deleteApplicationAction}>
            <input type="hidden" name="id" value={application.id} />
          </form>
          <DeleteConfirmButton
            formId={`delete-application-${application.id}`}
            itemLabel="application"
            triggerLabel="Remove"
            size="sm"
            className="text-destructive"
          />
        </CardContent>
      </details>
    </Card>
  );
}
