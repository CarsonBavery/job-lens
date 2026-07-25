"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  baseDocumentLimit,
  countBaseDocuments,
  createBaseDocument,
  deleteDocument,
  updateDocumentContent,
  type SubscriptionTier,
} from "@/lib/documents/db";

async function requireUserAndTier() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  return { supabase, user, tier: (profile?.subscription_tier ?? "free") as SubscriptionTier };
}

export async function createCoverLetter(formData: FormData) {
  const { supabase, user, tier } = await requireUserAndTier();

  const count = await countBaseDocuments(supabase, "cover_letters", user.id);
  if (count >= baseDocumentLimit("cover_letters", tier)) {
    redirect("/dashboard/cover-letters?error=limit");
  }

  const title = (formData.get("title") as string)?.trim() || "Untitled Cover Letter";
  const id = await createBaseDocument(supabase, "cover_letters", user.id, title);
  redirect(`/dashboard/cover-letters/${id}`);
}

export async function updateCoverLetterContent(
  id: string,
  content: Record<string, unknown>,
  title: string,
) {
  const supabase = await createClient();
  await updateDocumentContent(supabase, "cover_letters", id, content, title);
  revalidatePath(`/dashboard/cover-letters/${id}`);
}

export async function deleteCoverLetter(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await deleteDocument(supabase, "cover_letters", id);
  revalidatePath("/dashboard/cover-letters");
  redirect("/dashboard/cover-letters");
}
