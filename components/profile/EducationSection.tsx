"use client";

import { useActionState } from "react";
import type { EducationRecord } from "@/lib/education/db";
import { createEducation, deleteEducationAction, updateEducationAction } from "@/lib/education/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const initialState = { error: null };

export function EducationSection({ education }: { education: EducationRecord[] }) {
  const [state, formAction, isPending] = useActionState(createEducation, initialState);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Education</h2>

      <div className="flex flex-col gap-2">
        {education.map((entry) => (
          <Card key={entry.id} className="py-0">
            <details>
              <summary className="cursor-pointer p-4">
                <span className="font-medium">{entry.institution}</span>
                {entry.degree && (
                  <span className="ml-2 text-sm text-muted-foreground">{entry.degree}</span>
                )}
                {entry.field_of_study && (
                  <span className="ml-2 text-sm text-muted-foreground">{entry.field_of_study}</span>
                )}
              </summary>
              <CardContent className="flex flex-col gap-2 pb-4">
                <form action={updateEducationAction} className="flex flex-col gap-2">
                  <input type="hidden" name="id" value={entry.id} />
                  <Input name="institution" defaultValue={entry.institution} />
                  <Input name="degree" defaultValue={entry.degree ?? ""} placeholder="Degree" />
                  <Input
                    name="fieldOfStudy"
                    defaultValue={entry.field_of_study ?? ""}
                    placeholder="Field of study"
                  />
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
                  <Textarea name="description" defaultValue={entry.description ?? ""} rows={2} />
                  <Button type="submit" size="sm" className="self-start">
                    Save
                  </Button>
                </form>
                <form action={deleteEducationAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                    Delete
                  </Button>
                </form>
              </CardContent>
            </details>
          </Card>
        ))}
        {education.length === 0 && (
          <p className="py-3 text-sm text-muted-foreground">No education entries yet.</p>
        )}
      </div>

      <Card>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-2">
            <Input name="institution" required placeholder="Institution" />
            <Input name="degree" placeholder="Degree" />
            <Input name="fieldOfStudy" placeholder="Field of study" />
            <div className="flex gap-2">
              <Input type="date" name="startDate" aria-label="Start date" className="flex-1" />
              <Input type="date" name="endDate" aria-label="End date" className="flex-1" />
            </div>
            <Textarea name="description" rows={2} placeholder="Description (optional)" />
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isPending} className="self-start">
              {isPending ? "Adding…" : "Add education"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
