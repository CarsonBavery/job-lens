"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createApplication,
  deleteApplication,
  findApplicationByJobPosting,
  updateApplication,
  type ApplicationStatus,
} from "./db";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

// Saving the same job twice is a no-op, not a duplicate row -- a user
// re-clicking "Save" on a job search result they already saved shouldn't
// create a second application for it.
export async function saveJob(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const jobPostingId = formData.get("jobPostingId") as string;

  const existing = await findApplicationByJobPosting(supabase, user.id, jobPostingId);
  if (!existing) {
    await createApplication(supabase, user.id, jobPostingId);
  }
  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/applications");
}

export async function updateApplicationAction(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = formData.get("id") as string;
  const status = formData.get("status") as ApplicationStatus;
  const resumeId = (formData.get("resumeId") as string) || null;
  const coverLetterId = (formData.get("coverLetterId") as string) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  // Auto-stamp applied_at the first time a status moves to "applied" --
  // not overwritten on subsequent edits, so it stays the real application
  // date even if the user later tweaks notes or the linked resume.
  const fields: Parameters<typeof updateApplication>[2] = {
    status,
    resume_id: resumeId,
    cover_letter_id: coverLetterId,
    notes,
  };
  if (status === "applied") {
    const current = formData.get("currentAppliedAt") as string;
    if (!current) fields.applied_at = new Date().toISOString();
  }

  await updateApplication(supabase, id, fields);
  revalidatePath("/dashboard/applications");
}

export async function deleteApplicationAction(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = formData.get("id") as string;
  await deleteApplication(supabase, id);
  revalidatePath("/dashboard/applications");
}
