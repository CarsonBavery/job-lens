import type { ApplicationRecord, ApplicationStatus } from "@/lib/applications/db";
import type { DocumentRecord } from "@/lib/documents/db";
import { updateApplicationAction, deleteApplicationAction } from "@/lib/applications/actions";

const STATUSES: ApplicationStatus[] = ["saved", "applied", "interviewing", "offer", "rejected"];

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
    <li className="py-3">
      <details>
        <summary className="cursor-pointer">
          <span className="font-medium">{posting?.title ?? "(job posting removed)"}</span>
          {posting?.company && <span className="ml-2 text-sm text-gray-500">{posting.company}</span>}
          <span className="ml-2 text-sm text-gray-500 capitalize">{application.status}</span>
          {posting?.status === "closed" && (
            <span className="ml-2 text-xs text-amber-700 dark:text-amber-400">Posting closed</span>
          )}
        </summary>

        {posting?.url && (
          <a
            href={posting.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm hover:underline"
          >
            View posting
          </a>
        )}

        <form action={updateApplicationAction} className="mt-3 flex flex-col gap-2">
          <input type="hidden" name="id" value={application.id} />
          <input type="hidden" name="currentAppliedAt" value={application.applied_at ?? ""} />

          <label className="text-xs text-gray-500">
            Status
            <select
              name="status"
              defaultValue={application.status}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-gray-500">
            Resume used
            <select
              name="resumeId"
              defaultValue={application.resume_id ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
            >
              <option value="">— none —</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.title}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-gray-500">
            Cover letter used
            <select
              name="coverLetterId"
              defaultValue={application.cover_letter_id ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
            >
              <option value="">— none —</option>
              {coverLetters.map((coverLetter) => (
                <option key={coverLetter.id} value={coverLetter.id}>
                  {coverLetter.title}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-gray-500">
            Notes
            <textarea
              name="notes"
              defaultValue={application.notes ?? ""}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
            />
          </label>

          <button
            type="submit"
            className="self-start rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
          >
            Save
          </button>
        </form>

        <form action={deleteApplicationAction} className="mt-2">
          <input type="hidden" name="id" value={application.id} />
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Remove
          </button>
        </form>
      </details>
    </li>
  );
}
