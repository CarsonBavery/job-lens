"use client";

import Link from "next/link";
import { useActionState } from "react";
import { findMatchingJobs, type MatchingJobsState } from "@/lib/matching/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { JobCategoryBadge } from "@/components/jobs/JobCategoryBadge";

const initialState: MatchingJobsState = { error: null, matches: null };

export function MatchingJobsPanel({ resumeId }: { resumeId: string }) {
  const [state, formAction, isPending] = useActionState(findMatchingJobs, initialState);

  return (
    <Card className="py-0">
      <details>
        <summary className="cursor-pointer p-4 text-sm font-medium">Matching jobs</summary>
        <CardContent className="pb-4">
          <form action={formAction} className="flex flex-col gap-3">
            <input type="hidden" name="resumeId" value={resumeId} />
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isPending} className="self-start">
              {isPending ? "Searching…" : "Find matching jobs"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Ranks current job postings by how well they match this resume&apos;s content.
            </p>
          </form>
          {state.matches && (
            <ul data-testid="matching-jobs-results" className="mt-3 flex flex-col gap-2">
              {state.matches.length === 0 && (
                <li className="text-sm text-muted-foreground">No close matches found right now.</li>
              )}
              {state.matches.map((match) => (
                <li
                  key={match.id}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={match.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline"
                      >
                        {match.title}
                      </a>
                      <JobCategoryBadge category={match.category} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {match.company}
                      {match.location ? ` · ${match.location}` : ""}
                      {match.remote ? " · Remote" : ""}
                    </p>
                    <Link
                      href={`/dashboard/jobs/${match.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Tailor for this job →
                    </Link>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {Math.round(match.similarity * 100)}% match
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </details>
    </Card>
  );
}
