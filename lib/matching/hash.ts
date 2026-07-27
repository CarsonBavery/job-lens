import { createHash } from "node:crypto";

// Cheap staleness check for a resume's cached embedding: if the plain text
// a resume currently renders to still hashes the same as when its
// embedding was last computed, skip re-embedding (and the Gemini call that
// costs) on a repeat "find matching jobs" click.
export function hashText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}
