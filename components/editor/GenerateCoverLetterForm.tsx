"use client";

import { useActionState } from "react";
import { generateCoverLetter, type GenerateCoverLetterState } from "@/lib/cover-letters/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const initialState: GenerateCoverLetterState = { error: null };

export function GenerateCoverLetterForm({
  resumes,
}: {
  resumes: { id: string; title: string }[];
}) {
  const [state, formAction, isPending] = useActionState(generateCoverLetter, initialState);

  if (resumes.length === 0) {
    return (
      <Card>
        <CardContent className="text-sm text-muted-foreground">
          Generate a cover letter with AI once you&apos;ve created at least one resume — it uses
          your resume content to write something specific, not generic.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-0">
      <details>
        <summary className="cursor-pointer p-4 text-sm font-medium">Generate with AI</summary>
        <CardContent className="pb-4">
          <form action={formAction} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coverLetterResumeId">Based on resume</Label>
              <select
                id="coverLetterResumeId"
                name="resumeId"
                required
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title}
                  </option>
                ))}
              </select>
            </div>
            <Textarea
              name="jobDescription"
              required
              rows={6}
              placeholder="Paste the job description here…"
            />
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isPending} className="self-start">
              {isPending ? "Generating…" : "Generate cover letter"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Fills your free base cover letter first; once you have one, further job-specific
              generations don&apos;t count against your limit.
            </p>
          </form>
        </CardContent>
      </details>
    </Card>
  );
}
