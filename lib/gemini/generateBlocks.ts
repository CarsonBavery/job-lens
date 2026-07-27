import { getGeminiClient, GEMINI_TEXT_MODEL } from "./client";
import { retryOnRateLimit } from "./retryOnRateLimit";
import { BlocksResponseSchema, blocksJsonSchema, type Block } from "./schemas";

export async function generateBlocks(prompt: string): Promise<Block[]> {
  const response = await retryOnRateLimit(() =>
    getGeminiClient().models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: blocksJsonSchema,
      },
    }),
  );

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  // Zod-validated even though the request was schema-guided -- don't trust
  // model output as a substitute for runtime validation at this boundary.
  return BlocksResponseSchema.parse(JSON.parse(text)).blocks;
}
