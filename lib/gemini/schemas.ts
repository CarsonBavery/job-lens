import { z } from "zod";

// Flat, simple structure Gemini generates content in -- deliberately not
// raw Tiptap/ProseMirror JSON, which is too easy for a model to get subtly
// wrong (nested node shapes, mark arrays, etc). lib/tiptap/fromBlocks.ts
// converts this into real editor content.
export const BlockSchema = z.object({
  type: z.enum(["heading1", "heading2", "heading3", "paragraph", "bullet"]),
  text: z.string(),
});
export type Block = z.infer<typeof BlockSchema>;

export const BlocksResponseSchema = z.object({
  blocks: z.array(BlockSchema),
});
export type BlocksResponse = z.infer<typeof BlocksResponseSchema>;

// Hand-written JSON Schema mirroring BlocksResponseSchema above, passed to
// Gemini's responseJsonSchema config. Keep these two in sync.
export const blocksJsonSchema = {
  type: "object",
  properties: {
    blocks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["heading1", "heading2", "heading3", "paragraph", "bullet"],
          },
          text: { type: "string" },
        },
        required: ["type", "text"],
      },
    },
  },
  required: ["blocks"],
};
