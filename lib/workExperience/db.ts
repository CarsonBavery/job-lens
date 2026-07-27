import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface WorkExperienceRecord {
  id: string;
  user_id: string;
  company: string;
  title: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function listWorkExperience(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<WorkExperienceRecord[]> {
  const { data, error } = await supabase
    .from("work_experience")
    .select(
      "id, user_id, company, title, location, start_date, end_date, description, created_at, updated_at",
    )
    .eq("user_id", userId)
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function insertWorkExperience(
  supabase: SupabaseClient<Database>,
  fields: {
    user_id: string;
    company: string;
    title: string;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
  },
): Promise<string> {
  const { data, error } = await supabase.from("work_experience").insert(fields).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function updateWorkExperience(
  supabase: SupabaseClient<Database>,
  id: string,
  fields: Partial<Omit<WorkExperienceRecord, "id" | "user_id" | "created_at" | "updated_at">>,
): Promise<void> {
  const { error } = await supabase.from("work_experience").update(fields).eq("id", id);
  if (error) throw error;
}

export async function deleteWorkExperience(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("work_experience").delete().eq("id", id);
  if (error) throw error;
}
