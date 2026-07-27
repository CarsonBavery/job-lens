"use client";

import { useActionState } from "react";
import type { ProjectRecord } from "@/lib/projects/db";
import { createProject, deleteProjectAction, updateProjectAction } from "@/lib/projects/actions";

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
        <span className="text-sm text-gray-500">
          {projects.length} / {limit} used
        </span>
      </div>

      <ul className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
        {projects.map((project) => (
          <li key={project.id} className="py-3">
            <details>
              <summary className="cursor-pointer">
                <span className="font-medium">{project.title}</span>
                {project.tech_stack && (
                  <span className="ml-2 text-sm text-gray-500">{project.tech_stack}</span>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-gray-500 hover:underline"
                  >
                    GitHub
                  </a>
                )}
              </summary>
              {project.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
              )}
              <form action={updateProjectAction} className="mt-3 flex flex-col gap-2">
                <input type="hidden" name="id" value={project.id} />
                <input
                  name="title"
                  defaultValue={project.title}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                />
                <input
                  name="techStack"
                  defaultValue={project.tech_stack ?? ""}
                  placeholder="Tech stack"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                />
                <textarea
                  name="description"
                  defaultValue={project.description ?? ""}
                  rows={3}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="self-start rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
                  >
                    Save
                  </button>
                </div>
              </form>
              <form action={deleteProjectAction} className="mt-2">
                <input type="hidden" name="id" value={project.id} />
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Delete
                </button>
              </form>
            </details>
          </li>
        ))}
        {projects.length === 0 && <p className="py-3 text-sm text-gray-500">No projects yet.</p>}
      </ul>

      <form action={formAction} className="flex flex-col gap-2 rounded-md border border-gray-200 p-4 dark:border-gray-800">
        <input
          name="title"
          required
          disabled={atLimit}
          placeholder="Project title"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
        <input
          name="githubUrl"
          disabled={atLimit}
          placeholder="GitHub repo URL (optional) — Gemini will summarize it"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
        <p className="text-xs text-gray-500">
          If you don&apos;t give a GitHub URL, you can describe the project yourself below.
        </p>
        <input
          name="techStack"
          disabled={atLimit}
          placeholder="Tech stack (if no GitHub URL)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
        <textarea
          name="description"
          disabled={atLimit}
          rows={3}
          placeholder="Description (if no GitHub URL)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={atLimit || isPending}
          className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add project"}
        </button>
        {atLimit && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            You&apos;ve reached your project limit. Upgrade to add more.
          </p>
        )}
      </form>
    </section>
  );
}
