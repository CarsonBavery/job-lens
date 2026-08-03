export type { JobSourceName, JobCategory } from "@/types/database";

// What every source connector normalizes its API's response into. Fields a
// source doesn't provide are left null rather than guessed.
export interface NormalizedJobPosting {
  externalId: string;
  company: string;
  title: string;
  location: string | null;
  remote: boolean;
  description: string | null;
  url: string;
  postedAt: string | null; // ISO 8601
  // A source-provided department/team label, when one exists (e.g. Lever's
  // `categories.team`, Greenhouse's `departments`) -- fed into
  // categorize.ts's department short-circuit before it falls back to title
  // keyword matching. Explicitly null (not just omitted) when a source has
  // no such structured signal (Ashby, Workable), so that's a documented
  // fact about the source, not an accidental gap.
  departmentHint: string | null;
}
