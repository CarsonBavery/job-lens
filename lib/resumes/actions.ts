"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { JSONContent } from "@tiptap/react";
import { createClient } from "@/lib/supabase/server";
import {
  baseDocumentLimit,
  countBaseDocuments,
  createBaseDocument,
  deleteDocument,
  getDocument,
  insertDocument,
  updateDocumentContent,
  type SubscriptionTier,
} from "@/lib/documents/db";
import { tailorResumeContent } from "@/lib/gemini/tailorResume";
import { tiptapToPlainText } from "@/lib/tiptap/toPlainText";
import { blocksToTiptap } from "@/lib/tiptap/fromBlocks";
import { listProjects } from "@/lib/projects/db";
import { listEducation } from "@/lib/education/db";
import { listWorkExperience } from "@/lib/workExperience/db";
import { formatCareerProfileForPrompt } from "@/lib/profile/formatForPrompt";

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

export interface TailorResumeState {
  error: string | null;
}

// Tailored copies are is_base: false -- they don't count against the
// free-tier resume limit, only the base resume they're generated from does.
export async function tailorResume(
  _prevState: TailorResumeState,
  formData: FormData,
): Promise<TailorResumeState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const resumeId = formData.get("resumeId") as string;
  const jobDescription = (formData.get("jobDescription") as string)?.trim();
  if (!jobDescription) {
    return { error: "Paste the job description first." };
  }

  const source = await getDocument(supabase, "resumes", resumeId);
  if (!source) {
    return { error: "Resume not found." };
  }

  const [projects, education, workExperience] = await Promise.all([
    listProjects(supabase, user.id),
    listEducation(supabase, user.id),
    listWorkExperience(supabase, user.id),
  ]);
  const careerProfile = formatCareerProfileForPrompt(projects, education, workExperience);

  let blocks;
  try {
    blocks = await tailorResumeContent({
      resumeText: tiptapToPlainText(source.content as JSONContent),
      jobDescription,
      careerProfile,
    });
  } catch {
    return { error: "The AI tailoring request failed. Try again in a moment." };
  }

  const id = await insertDocument(
    supabase,
    "resumes",
    {
      user_id: user.id,
      title: `${source.title} (tailored)`,
      is_base: false,
      content: blocksToTiptap(blocks),
    },
    { base_resume_id: source.id },
  );

  redirect(`/dashboard/resumes/${id}`);
}
