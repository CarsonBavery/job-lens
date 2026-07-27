"use client";

import { useActionState } from "react";
import type { EducationRecord } from "@/lib/education/db";
import { createEducation, deleteEducationAction, updateEducationAction } from "@/lib/education/actions";

const initialState = { error: null };

export function EducationSection({ education }: { education: EducationRecord[] }) {
  const [state, formAction, isPending] = useActionState(createEducation, initialState);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Education</h2>

      <ul className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
        {education.map((entry) => (
          <li key={entry.id} className="py-3">
            <details>
              <summary className="cursor-pointer">
                <span className="font-medium">{entry.institution}</span>
                {entry.degree && <span className="ml-2 text-sm text-gray-500">{entry.degree}</span>}
                {entry.field_of_study && (
                  <span className="ml-2 text-sm text-gray-500">{entry.field_of_study}</span>
                )}
              </summary>
              <form action={updateEducationAction} className="mt-3 flex flex-col gap-2">
                <input type="hidden" name="id" value={entry.id} />
                <input
                  name="institution"
                  defaultValue={entry.institution}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                />
                <input
                  name="degree"
                  defaultValue={entry.degree ?? ""}
                  placeholder="Degree"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                />
                <input
                  name="fieldOfStudy"
                  defaultValue={entry.field_of_study ?? ""}
                  placeholder="Field of study"
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
              <form action={deleteEducationAction} className="mt-2">
                <input type="hidden" name="id" value={entry.id} />
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Delete
                </button>
              </form>
            </details>
          </li>
        ))}
        {education.length === 0 && <p className="py-3 text-sm text-gray-500">No education entries yet.</p>}
      </ul>

      <form action={formAction} className="flex flex-col gap-2 rounded-md border border-gray-200 p-4 dark:border-gray-800">
        <input
          name="institution"
          required
          placeholder="Institution"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
        <input
          name="degree"
          placeholder="Degree"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
        <input
          name="fieldOfStudy"
          placeholder="Field of study"
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
          {isPending ? "Adding…" : "Add education"}
        </button>
      </form>
    </section>
  );
}
