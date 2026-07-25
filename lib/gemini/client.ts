import { GoogleGenAI } from "@google/genai";

// Model used for resume tailoring, cover letter generation, and job
// match scoring. Centralized here so it's a one-line change to upgrade.
export const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
export const GEMINI_EMBEDDING_MODEL = "text-embedding-004";

let cachedClient: GoogleGenAI | null = null;

// Server-only. Lazily constructed: this module is imported transitively by
// most pages (via Server Actions), so building the client eagerly at module
// load would construct it -- and warn about a missing API key -- even for
// routes that never call Gemini.
export function getGeminiClient(): GoogleGenAI {
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return cachedClient;
}
