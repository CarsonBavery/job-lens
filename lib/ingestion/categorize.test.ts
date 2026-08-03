import { describe, expect, it } from "vitest";
import { categorizeJobPosting } from "./categorize";

describe("categorizeJobPosting", () => {
  it("classifies a clear software title", () => {
    expect(categorizeJobPosting({ title: "Senior Software Engineer" })).toBe("software");
  });

  it("classifies data/ML roles", () => {
    expect(categorizeJobPosting({ title: "Machine Learning Engineer" })).toBe("data_ml");
    expect(categorizeJobPosting({ title: "Data Scientist, Growth" })).toBe("data_ml");
  });

  it("classifies hardware roles", () => {
    expect(categorizeJobPosting({ title: "Electrical Engineer, Power Systems" })).toBe("hardware");
  });

  it("classifies biotech roles", () => {
    expect(categorizeJobPosting({ title: "Research Associate, Molecular Biology" })).toBe("biotech");
  });

  it("classifies infrastructure/security roles", () => {
    expect(categorizeJobPosting({ title: "Site Reliability Engineer" })).toBe("infrastructure_security");
  });

  it("classifies other-STEM roles not covered by a specific bucket", () => {
    expect(categorizeJobPosting({ title: "Aerospace Systems Engineer" })).toBe("other_stem");
  });

  it("falls back to non_technical when no keyword matches", () => {
    expect(categorizeJobPosting({ title: "Chief of Staff" })).toBe("non_technical");
  });

  it("short-circuits on an unambiguous non-technical department hint, even with an engineering-adjacent title", () => {
    expect(
      categorizeJobPosting({ title: "Solutions Engineer", departmentHint: "Sales" }),
    ).toBe("non_technical");
  });

  it("does not short-circuit on an ambiguous 'Engineering' department -- falls through to title keywords", () => {
    expect(
      categorizeJobPosting({ title: "Backend Engineer", departmentHint: "Engineering" }),
    ).toBe("software");
  });

  it("uses description text when the title alone is ambiguous", () => {
    expect(
      categorizeJobPosting({
        title: "Engineer II",
        description: "Build and maintain our machine learning training pipelines.",
      }),
    ).toBe("data_ml");
  });

  it("is case- and punctuation-insensitive", () => {
    expect(categorizeJobPosting({ title: "SOFTWARE ENGINEER (Backend)" })).toBe("software");
  });

  it("prefers the higher-priority category on a tie", () => {
    // Matches both "software engineer" (software) and "data engineer" (data_ml)
    // -- software is listed first in CATEGORY_KEYWORDS and wins ties.
    expect(
      categorizeJobPosting({ title: "Software Engineer, Data Engineer Team" }),
    ).toBe("software");
  });
});
