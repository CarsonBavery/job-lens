"use client";

import { useActionState } from "react";
import { tailorResume, type TailorResumeState } from "@/lib/resumes/actions";

const initialState: TailorResumeState = { error: null };

export function TailorResumeForm({ resumeId }: { resumeId: string }) {
  const [state, formAction, isPending] = useActionState(tailorResume, initialState);

  return (
    <details className="rounded-md border border-gray-200 p-4 dark:border-gray-800">
      <summary className="cursor-pointer text-sm font-medium">Tailor for a job (AI)</summary>
      <form action={formAction} className="mt-3 flex flex-col gap-3">
        <input type="hidden" name="resumeId" value={resumeId} />
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
          {isPending ? "Tailoring…" : "Generate tailored resume"}
        </button>
        <p className="text-xs text-gray-500">
          Creates a new copy tailored to this job — your original resume is untouched and this
          doesn&apos;t count against your resume limit.
        </p>
      </form>
    </details>
  );
}
