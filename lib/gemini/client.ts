import { GoogleGenAI } from "@google/genai";

// Model used for resume tailoring, cover letter generation, and job
// match scoring. Centralized here so it's a one-line change to upgrade.
//
// Verified live against the project's actual API key on 2026-07-25 via
// GET https://generativelanguage.googleapis.com/v1beta/models -- pinned
// snapshot names (e.g. gemini-2.5-flash) can 404 for newer API keys even
// while still listed as available, so these use Google's rolling aliases
// instead. Re-verify against the ListModels endpoint if generation starts
// failing with a 404.
export const GEMINI_TEXT_MODEL = "gemini-flash-latest";
export const GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";

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
