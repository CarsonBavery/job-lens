"use client";

import { useActionState } from "react";
import type { WorkExperienceRecord } from "@/lib/workExperience/db";
import {
  createWorkExperience,
  deleteWorkExperienceAction,
  updateWorkExperienceAction,
} from "@/lib/workExperience/actions";

const initialState = { error: null };

export function WorkExperienceSection({ experience }: { experience: WorkExperienceRecord[] }) {
  const [state, formAction, isPending] = useActionState(createWorkExperience, initialState);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Work Experience</h2>

      <ul className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
        {experience.map((entry) => (
          <li key={entry.id} className="py-3">
            <details>
              <summary className="cursor-pointer">
                <span className="font-medium">{entry.title}</span>
                <span className="ml-2 text-sm text-gray-500">{entry.company}</span>
                {!entry.end_date && (
                  <span className="ml-2 text-xs text-gray-500">(current)</span>
                )}
              </summary>
              <form action={updateWorkExperienceAction} className="mt-3 flex flex-col gap-2">
                <input type="hidden" name="id" value={entry.id} />
                <input
                  name="title"
                  defaultValue={entry.title}
                  placeholder="Title"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                />
                <input
                  name="company"
                  defaultValue={entry.company}
                  placeholder="Company"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                />
                <input
                  name="location"
                  defaultValue={entry.location ?? ""}
                  placeholder="Location"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={entry.start_date ?? ""}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                  />
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={entry.end_date ?? ""}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                  />
                </div>
                <p className="text-xs text-gray-500">Leave end date blank for a current role.</p>
                <textarea
                  name="description"
                  defaultValue={entry.description ?? ""}
                  rows={2}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                />
                <button
                  type="submit"
                  className="self-start rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
                >
                  Save
                </button>
              </form>
              <form action={deleteWorkExperienceAction} className="mt-2">
                <input type="hidden" name="id" value={entry.id} />
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Delete
                </button>
              </form>
            </details>
          </li>
        ))}
        {experience.length === 0 && <p className="py-3 text-sm text-gray-500">No work experience yet.</p>}
      </ul>

      <form action={formAction} className="flex flex-col gap-2 rounded-md border border-gray-200 p-4 dark:border-gray-800">
        <input
          name="title"
          required
          placeholder="Title"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
        <input
          name="company"
          required
          placeholder="Company"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
        <input
          name="location"
          placeholder="Location"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
        <div className="flex gap-2">
          <input
            type="date"
            name="startDate"
            aria-label="Start date"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
          />
          <input
            type="date"
            name="endDate"
            aria-label="End date"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
          />
        </div>
        <p className="text-xs text-gray-500">Leave end date blank for a current role.</p>
        <textarea
          name="description"
          rows={2}
          placeholder="Description (optional)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add work experience"}
        </button>
      </form>
    </section>
  );
}
