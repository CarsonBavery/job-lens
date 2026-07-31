"use client";

import { useActionState } from "react";
import { tailorResume, type TailorResumeState } from "@/lib/resumes/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const initialState: TailorResumeState = { error: null };

const selectClass =
  "h-10 rounded-lg border border-input bg-transparent px-3 py-1.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function TailorForJobForm({
  jobPostingId,
  hasDescription,
  resumes,
}: {
  jobPostingId: string;
  hasDescription: boolean;
  resumes: { id: string; title: string }[];
}) {
  const [state, formAction, isPending] = useActionState(tailorResume, initialState);

  if (resumes.length === 0) {
    return (
      <Card>
        <CardContent className="text-sm text-muted-foreground">
          Create a resume first to tailor one for this job.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="jobPostingId" value={jobPostingId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tailorResumeId">Resume to tailor</Label>
            <select id="tailorResumeId" name="resumeId" required className={selectClass}>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.title}
                </option>
              ))}
            </select>
          </div>
          {!hasDescription && (
            <Textarea
              name="jobDescription"
              required
              rows={6}
              placeholder="This posting doesn't include a description — paste it here…"
            />
          )}
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isPending} className="self-start">
            {isPending ? "Tailoring…" : "Tailor a resume for this job"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Creates a new copy tailored to this job and saves it to your applications — your
            original resume is untouched and this doesn&apos;t count against your resume limit.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
