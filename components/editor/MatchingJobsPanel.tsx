"use client";

import { useActionState } from "react";
import { findMatchingJobs, type MatchingJobsState } from "@/lib/matching/actions";

const initialState: MatchingJobsState = { error: null, matches: null };

export function MatchingJobsPanel({ resumeId }: { resumeId: string }) {
  const [state, formAction, isPending] = useActionState(findMatchingJobs, initialState);

  return (
    <details className="rounded-md border border-gray-200 p-4 dark:border-gray-800">
      <summary className="cursor-pointer text-sm font-medium">Matching jobs</summary>
      <form action={formAction} className="mt-3 flex flex-col gap-3">
        <input type="hidden" name="resumeId" value={resumeId} />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {isPending ? "Searching…" : "Find matching jobs"}
        </button>
        <p className="text-xs text-gray-500">
          Ranks current job postings by how well they match this resume&apos;s content.
        </p>
      </form>
      {state.matches && (
        <ul data-testid="matching-jobs-results" className="mt-3 flex flex-col gap-2">
          {state.matches.length === 0 && (
            <li className="text-sm text-gray-500">No close matches found right now.</li>
          )}
          {state.matches.map((match) => (
            <li
              key={match.id}
              className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2 dark:border-gray-800"
            >
              <div>
                <a
                  href={match.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline"
                >
                  {match.title}
                </a>
                <p className="text-xs text-gray-500">
                  {match.company}
                  {match.location ? ` · ${match.location}` : ""}
                  {match.remote ? " · Remote" : ""}
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium text-gray-500">
                {Math.round(match.similarity * 100)}% match
              </span>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
