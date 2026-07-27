"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteWorkExperience, insertWorkExperience, updateWorkExperience } from "./db";

export interface CreateWorkExperienceState {
  error: string | null;
}

export async function createWorkExperience(
  _prevState: CreateWorkExperienceState,
  formData: FormData,
): Promise<CreateWorkExperienceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const company = (formData.get("company") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  if (!company || !title) {
    return { error: "Company and title are required." };
  }

  await insertWorkExperience(supabase, {
    user_id: user.id,
    company,
    title,
    location: (formData.get("location") as string)?.trim() || null,
    start_date: (formData.get("startDate") as string) || null,
    end_date: (formData.get("endDate") as string) || null,
    description: (formData.get("description") as string)?.trim() || null,
  });
  revalidatePath("/dashboard/profile");
  return { error: null };
}

export async function updateWorkExperienceAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await updateWorkExperience(supabase, id, {
    company: (formData.get("company") as string)?.trim(),
    title: (formData.get("title") as string)?.trim(),
    location: (formData.get("location") as string)?.trim() || null,
    start_date: (formData.get("startDate") as string) || null,
    end_date: (formData.get("endDate") as string) || null,
    description: (formData.get("description") as string)?.trim() || null,
  });
  revalidatePath("/dashboard/profile");
}

export async function deleteWorkExperienceAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await deleteWorkExperience(supabase, id);
  revalidatePath("/dashboard/profile");
}
