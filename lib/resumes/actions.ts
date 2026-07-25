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

export async function createResume(formData: FormData) {
  const { supabase, user, tier } = await requireUserAndTier();

  const count = await countBaseDocuments(supabase, "resumes", user.id);
  if (count >= baseDocumentLimit("resumes", tier)) {
    redirect("/dashboard/resumes?error=limit");
  }

  const title = (formData.get("title") as string)?.trim() || "Untitled Resume";
  const id = await createBaseDocument(supabase, "resumes", user.id, title);
  redirect(`/dashboard/resumes/${id}`);
}

export async function updateResumeContent(
  id: string,
  content: Record<string, unknown>,
  title: string,
) {
  const supabase = await createClient();
  await updateDocumentContent(supabase, "resumes", id, content, title);
  revalidatePath(`/dashboard/resumes/${id}`);
}

export async function deleteResume(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await deleteDocument(supabase, "resumes", id);
  revalidatePath("/dashboard/resumes");
  redirect("/dashboard/resumes");
}
