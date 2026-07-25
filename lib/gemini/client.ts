import { GoogleGenAI } from "@google/genai";

// Server-only. Never import from a Client Component.
export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Model used for resume tailoring, cover letter generation, and job
// match scoring. Centralized here so it's a one-line change to upgrade.
export const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
export const GEMINI_EMBEDDING_MODEL = "text-embedding-004";
