import { getGeminiClient, GEMINI_TEXT_MODEL } from "./client";
import { retryOnRateLimit } from "./retryOnRateLimit";
import { ProjectSummarySchema, projectSummaryJsonSchema, type ProjectSummary } from "./schemas";

// Explicitly a one-time call, made once at project-creation time (see
// lib/projects/actions.ts) -- not re-read on every subsequent tailoring or
// match-scoring call, to keep ongoing token cost near zero. The generated
// description/techStack are stored as ordinary editable fields afterward,
// same as any other project data.
export async function summarizeProjectFromReadme(params: {
  title: string;
  repoDescription: string | null;
  language: string | null;
  readme: string | null;
}): Promise<ProjectSummary> {
  const prompt = `Summarize this software project for a resume/portfolio profile, based on its GitHub repository.

Project title: ${params.title}
Repository description: ${params.repoDescription ?? "(none)"}
Primary language: ${params.language ?? "(unknown)"}
README:
${(params.readme ?? "(no README available)").slice(0, 8000)}

Write a concise 2-4 sentence description of what the project does and any notable technical details, suitable for a candidate to show off in a resume-tailoring context. Also list the technology stack as a short comma-separated string (e.g. "TypeScript, React, PostgreSQL"). Do not fabricate technologies not evidenced by the README or repo metadata.`;

  const response = await retryOnRateLimit(() =>
    getGeminiClient().models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: projectSummaryJsonSchema,
      },
    }),
  );

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return ProjectSummarySchema.parse(JSON.parse(text));
}
