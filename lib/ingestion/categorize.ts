import type { JobCategory } from "@/types/database";

// Departments that are unambiguously non-technical regardless of company --
// short-circuits before keyword scoring. Deliberately excludes "engineering"
// and similar: that word alone spans software/hardware/infra, so an
// ambiguous or technical-sounding department still falls through to title
// keyword scoring below rather than being guessed here.
const NON_TECHNICAL_DEPARTMENTS = [
  "sales", "marketing", "finance", "legal", "hr", "people",
  "recruiting", "talent", "operations", "customer success",
  "customer support", "design", "product",
];

// Order matters: this is also the tie-break priority when a title scores
// equally across categories (e.g. "Software Engineer, Data Platform" hits
// both software and data_ml keywords -- software wins, listed first).
const CATEGORY_KEYWORDS: { category: JobCategory; keywords: string[] }[] = [
  {
    category: "software",
    keywords: [
      "software engineer", "swe", "frontend", "front-end", "backend", "back-end",
      "full stack", "full-stack", "web developer", "mobile engineer", "ios engineer",
      "android engineer", "platform engineer", "qa engineer", "sdet",
      "application engineer", "developer",
    ],
  },
  {
    category: "data_ml",
    keywords: [
      "data engineer", "data scientist", "data analyst", "machine learning",
      "ml engineer", "ai engineer", "artificial intelligence", "analytics engineer",
      "research scientist", "nlp", "computer vision", "deep learning", "llm",
    ],
  },
  {
    category: "hardware",
    keywords: [
      "hardware engineer", "electrical engineer", "mechanical engineer", "robotics",
      "firmware", "embedded", "manufacturing engineer", "mechatronics",
      "semiconductor", "asic", "fpga", "controls engineer",
    ],
  },
  {
    category: "biotech",
    keywords: [
      "biologist", "chemist", "biotech", "bioinformatics", "clinical", "laboratory",
      "lab technician", "life sciences", "pharma", "pharmacology", "research associate",
      "molecular biology", "genomics",
    ],
  },
  {
    category: "infrastructure_security",
    keywords: [
      "devops", "site reliability", "sre", "cloud engineer", "infrastructure engineer",
      "platform reliability", "security engineer", "cybersecurity", "it engineer",
      "network engineer", "systems administrator",
    ],
  },
  {
    category: "other_stem",
    keywords: [
      "aerospace", "physicist", "civil engineer", "chemical engineer", "scientist",
      "quantitative", "quant researcher", "mathematician", "statistician",
      "process engineer", "materials engineer",
    ],
  },
];

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function containsKeyword(haystack: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, "i").test(haystack);
}

// Pure and deterministic by design -- runs once per posting per ingestion
// pass, no network/AI call (see lib/ingestion/run.ts), so it stays cheap and
// unit-testable the same way buildDedupKey (normalize.ts) is.
export function categorizeJobPosting(input: {
  title: string;
  description?: string | null;
  departmentHint?: string | null;
}): JobCategory {
  const department = input.departmentHint ? normalize(input.departmentHint) : null;
  if (department && NON_TECHNICAL_DEPARTMENTS.some((dept) => department.includes(dept))) {
    return "non_technical";
  }

  const text = normalize([input.title, input.description].filter(Boolean).join(" "));

  let bestCategory: JobCategory | null = null;
  let bestScore = 0;
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    const score = keywords.filter((keyword) => containsKeyword(text, keyword)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory ?? "non_technical";
}
