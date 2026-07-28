"use client";

import { useActionState } from "react";
import type { WorkExperienceRecord } from "@/lib/workExperience/db";
import {
  createWorkExperience,
  deleteWorkExperienceAction,
  updateWorkExperienceAction,
} from "@/lib/workExperience/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const initialState = { error: null };

export function WorkExperienceSection({ experience }: { experience: WorkExperienceRecord[] }) {
  const [state, formAction, isPending] = useActionState(createWorkExperience, initialState);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Work Experience</h2>

      <div className="flex flex-col gap-2">
        {experience.map((entry) => (
          <Card key={entry.id} className="py-0">
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center gap-2 p-4">
                <span className="font-medium">{entry.title}</span>
                <span className="text-sm text-muted-foreground">{entry.company}</span>
                {!entry.end_date && <Badge variant="outline">current</Badge>}
              </summary>
              <CardContent className="flex flex-col gap-2 pb-4">
                <form action={updateWorkExperienceAction} className="flex flex-col gap-2">
                  <input type="hidden" name="id" value={entry.id} />
                  <Input name="title" defaultValue={entry.title} placeholder="Title" />
                  <Input name="company" defaultValue={entry.company} placeholder="Company" />
                  <Input name="location" defaultValue={entry.location ?? ""} placeholder="Location" />
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      name="startDate"
                      defaultValue={entry.start_date ?? ""}
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      name="endDate"
                      defaultValue={entry.end_date ?? ""}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave end date blank for a current role.
                  </p>
                  <Textarea name="description" defaultValue={entry.description ?? ""} rows={2} />
                  <Button type="submit" size="sm" className="self-start">
                    Save
                  </Button>
                </form>
                <form action={deleteWorkExperienceAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                    Delete
                  </Button>
                </form>
              </CardContent>
            </details>
          </Card>
        ))}
        {experience.length === 0 && (
          <p className="py-3 text-sm text-muted-foreground">No work experience yet.</p>
        )}
      </div>

      <Card>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-2">
            <Input name="title" required placeholder="Title" />
            <Input name="company" required placeholder="Company" />
            <Input name="location" placeholder="Location" />
            <div className="flex gap-2">
              <Input type="date" name="startDate" aria-label="Start date" className="flex-1" />
              <Input type="date" name="endDate" aria-label="End date" className="flex-1" />
            </div>
            <p className="text-xs text-muted-foreground">Leave end date blank for a current role.</p>
            <Textarea name="description" rows={2} placeholder="Description (optional)" />
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isPending} className="self-start">
              {isPending ? "Adding…" : "Add work experience"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
