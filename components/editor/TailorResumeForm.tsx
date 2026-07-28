"use client";

import { useActionState } from "react";
import { tailorResume, type TailorResumeState } from "@/lib/resumes/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const initialState: TailorResumeState = { error: null };

export function TailorResumeForm({ resumeId }: { resumeId: string }) {
  const [state, formAction, isPending] = useActionState(tailorResume, initialState);

  return (
    <Card className="py-0">
      <details>
        <summary className="cursor-pointer p-4 text-sm font-medium">Tailor for a job (AI)</summary>
        <CardContent className="pb-4">
          <form action={formAction} className="flex flex-col gap-3">
            <input type="hidden" name="resumeId" value={resumeId} />
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
              {isPending ? "Tailoring…" : "Generate tailored resume"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Creates a new copy tailored to this job — your original resume is untouched and this
              doesn&apos;t count against your resume limit.
            </p>
          </form>
        </CardContent>
      </details>
    </Card>
  );
}
