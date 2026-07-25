import { generateBlocks } from "./generateBlocks";
import type { Block } from "./schemas";

export async function generateCoverLetterContent(params: {
  resumeText: string;
  jobDescription: string;
}): Promise<Block[]> {
  const prompt = `You are a cover letter writing assistant. Write a professional, specific cover letter for the candidate below, targeting the job description provided.

Rules:
- Base every claim strictly on the candidate's actual resume content below -- do not invent experience, skills, or achievements not present there.
- Reference 1-2 specific, relevant pieces of the candidate's real experience rather than generic filler.
- Keep it concise: an opening paragraph, 1-2 body paragraphs, and a closing paragraph.
- Return it as a sequence of "paragraph" blocks only -- no headings or bullets.

--- CANDIDATE'S RESUME ---
${params.resumeText}

--- TARGET JOB DESCRIPTION ---
${params.jobDescription}`;

  return generateBlocks(prompt);
}
