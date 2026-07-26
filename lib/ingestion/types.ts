export type { JobSourceName } from "@/types/database";

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
}
