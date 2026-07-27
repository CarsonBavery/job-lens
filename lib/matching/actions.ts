"use server";

import { redirect } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { createClient } from "@/lib/supabase/server";
import { getDocument } from "@/lib/documents/db";
import { tiptapToPlainText } from "@/lib/tiptap/toPlainText";
import { embedText } from "@/lib/gemini/embedText";
import { hashText } from "@/lib/matching/hash";
import {
  getResumeEmbeddingState,
  matchJobsForResume,
  updateResumeEmbedding,
  type JobMatch,
} from "@/lib/matching/db";

export interface MatchingJobsState {
  error: string | null;
  matches: JobMatch[] | null;
}

// Computed lazily on click, not on every autosave -- most edits don't
// change the resume's semantic content enough to be worth a Gemini call,
// and this keeps a per-user Gemini cost tied to an explicit action rather
// than every keystroke-triggered save (see CLAUDE.md's "no per-user rate
// limiting yet" note -- this is exactly the kind of call that shouldn't be
// automatic until that exists).
export async function findMatchingJobs(
  _prevState: MatchingJobsState,
  formData: FormData,
): Promise<MatchingJobsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const resumeId = formData.get("resumeId") as string;
  const resume = await getDocument(supabase, "resumes", resumeId);
  if (!resume) {
    return { error: "Resume not found.", matches: null };
  }

  const plainText = tiptapToPlainText(resume.content as JSONContent);
  if (!plainText.trim()) {
    return { error: "Add some content to this resume first.", matches: null };
  }
  const currentHash = hashText(plainText);

  let embedding: number[];
  try {
    const existing = await getResumeEmbeddingState(supabase, resumeId);
    if (existing?.embedding && existing.embedding_source_hash === currentHash) {
      embedding = existing.embedding;
    } else {
      embedding = await embedText(plainText);
      await updateResumeEmbedding(supabase, resumeId, embedding, currentHash);
    }

    const matches = await matchJobsForResume(supabase, embedding);
    return { error: null, matches };
  } catch {
    return { error: "Couldn't find matching jobs right now. Try again in a moment.", matches: null };
  }
}
