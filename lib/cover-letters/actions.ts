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
  listBaseDocuments,
  updateDocumentContent,
  type SubscriptionTier,
} from "@/lib/documents/db";
import { generateCoverLetterContent } from "@/lib/gemini/generateCoverLetter";
import { tiptapToPlainText } from "@/lib/tiptap/toPlainText";
import { blocksToTiptap } from "@/lib/tiptap/fromBlocks";
import { checkAiRateLimit } from "@/lib/aiUsage/rateLimit";
import { recordAiGeneration } from "@/lib/aiUsage/db";

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

export interface GenerateCoverLetterState {
  error: string | null;
}

// Becomes the user's base cover letter (counts against the free-tier limit)
// if they don't have one yet; otherwise it's a tailored, non-counting extra
// linked to their existing base cover letter via base_cover_letter_id so it
// shows up in that base letter's "Tailored versions" list -- without that
// link a non-base cover letter would have no page that ever surfaces it.
export async function generateCoverLetter(
  _prevState: GenerateCoverLetterState,
  formData: FormData,
): Promise<GenerateCoverLetterState> {
  const { supabase, user, tier } = await requireUserAndTier();

  const resumeId = formData.get("resumeId") as string;
  const jobDescription = (formData.get("jobDescription") as string)?.trim();
  if (!resumeId) {
    return { error: "Choose a resume to base the cover letter on." };
  }
  if (!jobDescription) {
    return { error: "Paste the job description first." };
  }

  const rateLimitError = await checkAiRateLimit(supabase, user.id, tier);
  if (rateLimitError) {
    return { error: rateLimitError };
  }

  const resume = await getDocument(supabase, "resumes", resumeId);
  if (!resume) {
    return { error: "Resume not found." };
  }

  let blocks;
  try {
    blocks = await generateCoverLetterContent({
      resumeText: tiptapToPlainText(resume.content as JSONContent),
      jobDescription,
    });
  } catch {
    return { error: "The AI generation request failed. Try again in a moment." };
  }
  await recordAiGeneration(supabase, user.id);

  const count = await countBaseDocuments(supabase, "cover_letters", user.id);
  const isBase = count < baseDocumentLimit("cover_letters", tier);

  let baseCoverLetterId: string | null = null;
  if (!isBase) {
    const [existingBase] = await listBaseDocuments(supabase, "cover_letters", user.id);
    baseCoverLetterId = existingBase?.id ?? null;
  }

  const id = await insertDocument(
    supabase,
    "cover_letters",
    {
      user_id: user.id,
      title: isBase ? "Cover Letter" : "Cover Letter (tailored)",
      is_base: isBase,
      content: blocksToTiptap(blocks),
    },
    baseCoverLetterId ? { base_cover_letter_id: baseCoverLetterId } : {},
  );

  redirect(`/dashboard/cover-letters/${id}`);
}
