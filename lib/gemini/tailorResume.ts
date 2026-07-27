import { generateBlocks } from "./generateBlocks";
import type { Block } from "./schemas";

export async function tailorResumeContent(params: {
  resumeText: string;
  jobDescription: string;
  careerProfile?: string | null;
}): Promise<Block[]> {
  const careerProfileSection = params.careerProfile
    ? `\n\n--- CANDIDATE'S FULL CAREER PROFILE (projects, work history, education not necessarily on this specific resume) ---\n${params.careerProfile}\n\nYou may pull in relevant items from this profile (e.g. a project that isn't on the current resume but fits this job well) alongside the resume content -- still don't fabricate anything beyond what's listed here or in the resume itself.`
    : "";

  const prompt = `You are a resume tailoring assistant. Rewrite the candidate's resume below to better align with the target job description, while staying strictly truthful to their real experience.

Rules:
- Do not invent employers, job titles, dates, skills, or achievements that aren't already present or clearly implied in the original resume${params.careerProfile ? " or career profile below" : ""}.
- You may reorder, rephrase, and re-emphasize existing content to highlight what's most relevant to this job.
- Keep factual claims (company names, titles, dates) unchanged.
- Preserve the overall structure (headings, bullet points) the original resume uses.
- Return the full tailored resume as a sequence of blocks -- do not omit sections that are still relevant, even if unchanged.

--- CANDIDATE'S CURRENT RESUME ---
${params.resumeText}

--- TARGET JOB DESCRIPTION ---
${params.jobDescription}${careerProfileSection}`;

  return generateBlocks(prompt);
}
