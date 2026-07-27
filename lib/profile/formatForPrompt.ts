import type { ProjectRecord } from "@/lib/projects/db";
import type { EducationRecord } from "@/lib/education/db";
import type { WorkExperienceRecord } from "@/lib/workExperience/db";

// Flattens a user's career profile into plain text for a Gemini prompt --
// same lossy-by-design approach as lib/tiptap/toPlainText.ts. Returns null
// when the profile is empty so callers can omit the section entirely
// rather than send Gemini an empty "CAREER PROFILE" header.
export function formatCareerProfileForPrompt(
  projects: ProjectRecord[],
  education: EducationRecord[],
  workExperience: WorkExperienceRecord[],
): string | null {
  const sections: string[] = [];

  if (projects.length > 0) {
    sections.push(
      "Projects:\n" +
        projects
          .map((p) => `- ${p.title}${p.tech_stack ? ` (${p.tech_stack})` : ""}: ${p.description ?? ""}`)
          .join("\n"),
    );
  }

  if (workExperience.length > 0) {
    sections.push(
      "Work experience:\n" +
        workExperience
          .map(
            (w) =>
              `- ${w.title} at ${w.company}${w.end_date ? "" : " (current)"}: ${w.description ?? ""}`,
          )
          .join("\n"),
    );
  }

  if (education.length > 0) {
    sections.push(
      "Education:\n" +
        education
          .map((e) => `- ${e.degree ?? ""} ${e.field_of_study ?? ""} at ${e.institution}`.trim())
          .join("\n"),
    );
  }

  return sections.length > 0 ? sections.join("\n\n") : null;
}
