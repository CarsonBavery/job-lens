"use client";

import { useActionState } from "react";
import { generateCoverLetter, type GenerateCoverLetterState } from "@/lib/cover-letters/actions";

const initialState: GenerateCoverLetterState = { error: null };

export function GenerateCoverLetterForm({
  resumes,
}: {
  resumes: { id: string; title: string }[];
}) {
  const [state, formAction, isPending] = useActionState(generateCoverLetter, initialState);

  if (resumes.length === 0) {
    return (
      <p className="rounded-md border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800">
        Generate a cover letter with AI once you&apos;ve created at least one resume — it uses
        your resume content to write something specific, not generic.
      </p>
    );
  }

  return (
    <details className="rounded-md border border-gray-200 p-4 dark:border-gray-800">
      <summary className="cursor-pointer text-sm font-medium">Generate with AI</summary>
      <form action={formAction} className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Based on resume
          <select
            name="resumeId"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
          >
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.title}
              </option>
            ))}
          </select>
        </label>
        <textarea
          name="jobDescription"
          required
          rows={6}
          placeholder="Paste the job description here…"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {isPending ? "Generating…" : "Generate cover letter"}
        </button>
        <p className="text-xs text-gray-500">
          Fills your free base cover letter first; once you have one, further job-specific
          generations don&apos;t count against your limit.
        </p>
      </form>
    </details>
  );
}
