import { describe, expect, it } from "vitest";
import { formatCareerProfileForPrompt } from "./formatForPrompt";

describe("formatCareerProfileForPrompt", () => {
  it("returns null when the profile is entirely empty", () => {
    expect(formatCareerProfileForPrompt([], [], [])).toBeNull();
  });

  it("includes a project not present in a resume", () => {
    const text = formatCareerProfileForPrompt(
      [
        {
          id: "1",
          user_id: "u",
          title: "Side Project",
          description: "A CLI tool",
          tech_stack: "Rust",
          github_url: null,
          created_at: "",
          updated_at: "",
        },
      ],
      [],
      [],
    );
    expect(text).toContain("Side Project");
    expect(text).toContain("Rust");
  });

  it("marks a work experience entry with no end date as current", () => {
    const text = formatCareerProfileForPrompt(
      [],
      [],
      [
        {
          id: "1",
          user_id: "u",
          company: "Acme",
          title: "Engineer",
          location: null,
          start_date: "2020-01-01",
          end_date: null,
          description: null,
          created_at: "",
          updated_at: "",
        },
      ],
    );
    expect(text).toContain("(current)");
  });

  it("omits a section entirely when that category is empty", () => {
    const text = formatCareerProfileForPrompt(
      [],
      [
        {
          id: "1",
          user_id: "u",
          institution: "State University",
          degree: "BS",
          field_of_study: "Computer Science",
          start_date: null,
          end_date: null,
          description: null,
          created_at: "",
          updated_at: "",
        },
      ],
      [],
    );
    expect(text).not.toContain("Projects:");
    expect(text).not.toContain("Work experience:");
    expect(text).toContain("Education:");
  });
});
