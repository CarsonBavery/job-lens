"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteEducation, insertEducation, updateEducation } from "./db";

export interface CreateEducationState {
  error: string | null;
}

export async function createEducation(
  _prevState: CreateEducationState,
  formData: FormData,
): Promise<CreateEducationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const institution = (formData.get("institution") as string)?.trim();
  if (!institution) {
    return { error: "Institution is required." };
  }

  await insertEducation(supabase, {
    user_id: user.id,
    institution,
    degree: (formData.get("degree") as string)?.trim() || null,
    field_of_study: (formData.get("fieldOfStudy") as string)?.trim() || null,
    start_date: (formData.get("startDate") as string) || null,
    end_date: (formData.get("endDate") as string) || null,
    description: (formData.get("description") as string)?.trim() || null,
  });
  revalidatePath("/dashboard/profile");
  return { error: null };
}

export async function updateEducationAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await updateEducation(supabase, id, {
    institution: (formData.get("institution") as string)?.trim(),
    degree: (formData.get("degree") as string)?.trim() || null,
    field_of_study: (formData.get("fieldOfStudy") as string)?.trim() || null,
    start_date: (formData.get("startDate") as string) || null,
    end_date: (formData.get("endDate") as string) || null,
    description: (formData.get("description") as string)?.trim() || null,
  });
  revalidatePath("/dashboard/profile");
}

export async function deleteEducationAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await deleteEducation(supabase, id);
  revalidatePath("/dashboard/profile");
}
