import { getGeminiClient, GEMINI_EMBEDDING_MODEL } from "./client";
import { retryOnRateLimit } from "./retryOnRateLimit";

// Single-text counterpart to lib/ingestion/embed.ts's batch embedder --
// used for one-off embeddings (a resume's own content) rather than
// hundreds of job postings at once, so the batching complexity there
// doesn't apply here. Same 768-dim truncation for consistency with
// job_postings.embedding / resumes.embedding, since they're compared
// directly via cosine similarity in match_jobs_for_resume.
export async function embedText(text: string): Promise<number[]> {
  const response = await retryOnRateLimit(() =>
    getGeminiClient().models.embedContent({
      model: GEMINI_EMBEDDING_MODEL,
      contents: [text],
      config: { outputDimensionality: 768 },
    }),
  );

  const embedding = response.embeddings?.[0]?.values;
  if (!embedding) {
    throw new Error("Gemini returned no embedding");
  }
  return embedding;
}
