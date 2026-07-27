"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SubscriptionTier } from "@/lib/documents/db";
import { countProjects, deleteProject, insertProject, projectLimit, updateProject } from "./db";
import { fetchGithubRepo } from "@/lib/github/fetchRepo";
import { summarizeProjectFromReadme } from "@/lib/gemini/summarizeProject";
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

export interface CreateProjectState {
  error: string | null;
}

// If a GitHub URL is given, the README is fetched and summarized by Gemini
// once, right here at creation time -- not re-read on any later tailoring
// or match-scoring call (see lib/gemini/summarizeProject.ts). Without a
// URL, the user's own manual description/tech stack are used as-is.
export async function createProject(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const { supabase, user, tier } = await requireUserAndTier();

  const count = await countProjects(supabase, user.id);
  if (count >= projectLimit(tier)) {
    return { error: `You've reached your ${tier} tier limit of ${projectLimit(tier)} projects.` };
  }

  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    return { error: "Give the project a title." };
  }
  const githubUrl = (formData.get("githubUrl") as string)?.trim() || null;
  const manualDescription = (formData.get("description") as string)?.trim() || null;
  const manualTechStack = (formData.get("techStack") as string)?.trim() || null;

  let description = manualDescription;
  let techStack = manualTechStack;

  if (githubUrl) {
    const rateLimitError = await checkAiRateLimit(supabase, user.id, tier);
    if (rateLimitError) {
      return { error: rateLimitError };
    }
    try {
      const repo = await fetchGithubRepo(githubUrl);
      const summary = await summarizeProjectFromReadme({
        title,
        repoDescription: repo.description,
        language: repo.language,
        readme: repo.readme,
      });
      description = summary.description;
      techStack = summary.techStack;
      await recordAiGeneration(supabase, user.id);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Couldn't summarize that repository." };
    }
  }

  await insertProject(supabase, {
    user_id: user.id,
    title,
    description,
    tech_stack: techStack,
    github_url: githubUrl,
  });
  revalidatePath("/dashboard/profile");
  return { error: null };
}

export async function updateProjectAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await updateProject(supabase, id, {
    title: (formData.get("title") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || null,
    tech_stack: (formData.get("techStack") as string)?.trim() || null,
  });
  revalidatePath("/dashboard/profile");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await deleteProject(supabase, id);
  revalidatePath("/dashboard/profile");
}
