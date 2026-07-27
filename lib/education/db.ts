import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface EducationRecord {
  id: string;
  user_id: string;
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function listEducation(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<EducationRecord[]> {
  const { data, error } = await supabase
    .from("education")
    .select(
      "id, user_id, institution, degree, field_of_study, start_date, end_date, description, created_at, updated_at",
    )
    .eq("user_id", userId)
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function insertEducation(
  supabase: SupabaseClient<Database>,
  fields: {
    user_id: string;
    institution: string;
    degree: string | null;
    field_of_study: string | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
  },
): Promise<string> {
  const { data, error } = await supabase.from("education").insert(fields).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function updateEducation(
  supabase: SupabaseClient<Database>,
  id: string,
  fields: Partial<Omit<EducationRecord, "id" | "user_id" | "created_at" | "updated_at">>,
): Promise<void> {
  const { error } = await supabase.from("education").update(fields).eq("id", id);
  if (error) throw error;
}

export async function deleteEducation(supabase: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await supabase.from("education").delete().eq("id", id);
  if (error) throw error;
}
