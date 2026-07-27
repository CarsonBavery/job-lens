import { getGeminiClient, GEMINI_EMBEDDING_MODEL } from "@/lib/gemini/client";
import { retryOnRateLimit } from "@/lib/gemini/retryOnRateLimit";

const MAX_BATCH_SIZE = 100; // Gemini's embedContent hard limit per request

// job_postings.embedding is vector(768) -- gemini-embedding-001 defaults to
// 3072 dimensions, so this truncates via outputDimensionality rather than
// widening the column. Batches requests (chunked at Gemini's 100-text cap
// per call) rather than one call per posting: a real ingestion run against
// companies with 100+ open postings hit Gemini's per-minute rate limit
// almost immediately with the one-call-per-posting approach. See
// retryOnRateLimit for why batching alone wasn't enough either.
export async function embedJobPostingTexts(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const chunk = texts.slice(i, i + MAX_BATCH_SIZE);
    const response = await retryOnRateLimit(() =>
      getGeminiClient().models.embedContent({
        model: GEMINI_EMBEDDING_MODEL,
        contents: chunk,
        config: { outputDimensionality: 768 },
      }),
    );
    const embeddings = response.embeddings;
    if (!embeddings || embeddings.length !== chunk.length) {
      throw new Error("Gemini returned an unexpected number of embeddings for a batch");
    }
    for (const embedding of embeddings) {
      if (!embedding.values) {
        throw new Error("Gemini returned an embedding with no values");
      }
      results.push(embedding.values);
    }
  }

  return results;
}
