import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type DocTable = "resumes" | "cover_letters";
export type SubscriptionTier = "free" | "pro";

// Fields common to both resumes and cover_letters -- the two tables also
// have type-specific columns (job_title, base_resume_id, ...) that callers
// fetch directly when they need them.
export interface DocumentRecord {
  id: string;
  user_id: string;
  title: string;
  content: Record<string, unknown>;
  is_base: boolean;
  created_at: string;
  updated_at: string;
}

const BASE_LIMITS: Record<SubscriptionTier, Record<DocTable, number>> = {
  free: { resumes: 3, cover_letters: 1 },
  pro: { resumes: 25, cover_letters: 25 },
};

export function baseDocumentLimit(table: DocTable, tier: SubscriptionTier): number {
  return BASE_LIMITS[tier][table];
}

export const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

export async function countBaseDocuments(
  supabase: SupabaseClient<Database>,
  table: DocTable,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_base", true);
  if (error) throw error;
  return count ?? 0;
}

// Insert/Update shapes differ slightly between resumes and cover_letters
// (job_title, base_resume_id vs base_cover_letter_id), so this shared helper
// only touches the columns the two tables have in common -- the union of
// both tables' Insert types is what forces the cast below. `extra` carries
// table-specific columns (e.g. `base_resume_id`) the caller already knows
// the right key for.
export async function insertDocument(
  supabase: SupabaseClient<Database>,
  table: DocTable,
  fields: {
    user_id: string;
    title: string;
    content: Record<string, unknown>;
    is_base: boolean;
  },
  extra: Record<string, unknown> = {},
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from(table) as any)
    .insert({ ...fields, ...extra })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function createBaseDocument(
  supabase: SupabaseClient<Database>,
  table: DocTable,
  userId: string,
  title: string,
): Promise<string> {
  return insertDocument(supabase, table, {
    user_id: userId,
    title,
    is_base: true,
    content: EMPTY_DOC,
  });
}

export async function getDocument(
  supabase: SupabaseClient<Database>,
  table: DocTable,
  id: string,
): Promise<DocumentRecord | null> {
  const { data, error } = await supabase
    .from(table)
    .select("id, user_id, title, content, is_base, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    // 22P02 = invalid_text_representation -- e.g. a route param that isn't a
    // valid UUID at all. That's just as "not found" as a real missing row.
    if (error.code === "22P02") return null;
    throw error;
  }
  return data as DocumentRecord | null;
}

export async function listBaseDocuments(
  supabase: SupabaseClient<Database>,
  table: DocTable,
  userId: string,
): Promise<DocumentRecord[]> {
  const { data, error } = await supabase
    .from(table)
    .select("id, user_id, title, content, is_base, created_at, updated_at")
    .eq("user_id", userId)
    .eq("is_base", true)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentRecord[];
}

// Every resume/cover letter a user has, base and tailored alike -- used to
// populate the "which version did you actually use" picker on an
// application (Phase 7). listBaseDocuments alone would hide every tailored
// version, which defeats the point: an application should be able to point
// at the exact tailored copy sent for that job, not just a base document.
export async function listAllDocuments(
  supabase: SupabaseClient<Database>,
  table: DocTable,
  userId: string,
): Promise<DocumentRecord[]> {
  const { data, error } = await supabase
    .from(table)
    .select("id, user_id, title, content, is_base, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentRecord[];
}

// Tailored/AI-generated variants (is_base: false) don't show up in
// listBaseDocuments, so without this they become unreachable the moment a
// user navigates away from the redirect that created them -- there is no
// other list, link, or search that surfaces them. Called from a base
// document's editor page with its own id as parentId.
export async function listTailoredDocuments(
  supabase: SupabaseClient<Database>,
  table: DocTable,
  parentColumn: "base_resume_id" | "base_cover_letter_id",
  parentId: string,
): Promise<DocumentRecord[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from(table) as any)
    .select("id, user_id, title, content, is_base, created_at, updated_at")
    .eq(parentColumn, parentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentRecord[];
}

export async function updateDocumentContent(
  supabase: SupabaseClient<Database>,
  table: DocTable,
  id: string,
  content: Record<string, unknown>,
  title?: string,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from(table) as any)
    .update({ content, ...(title ? { title } : {}) })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDocument(
  supabase: SupabaseClient<Database>,
  table: DocTable,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}
