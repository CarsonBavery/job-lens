"use client";

import { useActionState } from "react";
import type { ProjectRecord } from "@/lib/projects/db";
import { createProject, deleteProjectAction, updateProjectAction } from "@/lib/projects/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const initialState = { error: null };

export function ProjectsSection({
  projects,
  limit,
}: {
  projects: ProjectRecord[];
  limit: number;
}) {
  const [state, formAction, isPending] = useActionState(createProject, initialState);
  const atLimit = projects.length >= limit;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <span className="text-sm text-muted-foreground">
          {projects.length} / {limit} used
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {projects.map((project) => (
          <Card key={project.id} className="py-0">
            <details>
              <summary className="cursor-pointer p-4">
                <span className="font-medium">{project.title}</span>
                {project.tech_stack && (
                  <span className="ml-2 text-sm text-muted-foreground">{project.tech_stack}</span>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-muted-foreground hover:underline"
                  >
                    GitHub
                  </a>
                )}
              </summary>
              <CardContent className="flex flex-col gap-2 pb-4">
                {project.description && (
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                )}
                <form action={updateProjectAction} className="flex flex-col gap-2">
                  <input type="hidden" name="id" value={project.id} />
                  <Input name="title" defaultValue={project.title} />
                  <Input name="techStack" defaultValue={project.tech_stack ?? ""} placeholder="Tech stack" />
                  <Textarea name="description" defaultValue={project.description ?? ""} rows={3} />
                  <Button type="submit" size="sm" className="self-start">
                    Save
                  </Button>
                </form>
                <form action={deleteProjectAction}>
                  <input type="hidden" name="id" value={project.id} />
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                    Delete
                  </Button>
                </form>
              </CardContent>
            </details>
          </Card>
        ))}
        {projects.length === 0 && (
          <p className="py-3 text-sm text-muted-foreground">No projects yet.</p>
        )}
      </div>

      <Card>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-2">
            <Input name="title" required disabled={atLimit} placeholder="Project title" />
            <Input
              name="githubUrl"
              disabled={atLimit}
              placeholder="GitHub repo URL (optional) — Gemini will summarize it"
            />
            <p className="text-xs text-muted-foreground">
              If you don&apos;t give a GitHub URL, you can describe the project yourself below.
            </p>
            <Input
              name="techStack"
              disabled={atLimit}
              placeholder="Tech stack (if no GitHub URL)"
            />
            <Textarea
              name="description"
              disabled={atLimit}
              rows={3}
              placeholder="Description (if no GitHub URL)"
            />
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={atLimit || isPending} className="self-start">
              {isPending ? "Adding…" : "Add project"}
            </Button>
            {atLimit && (
              <p className="text-sm text-amber-700 dark:text-amber-400">
                You&apos;ve reached your project limit. Upgrade to add more.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
