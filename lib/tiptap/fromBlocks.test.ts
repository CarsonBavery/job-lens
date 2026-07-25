import { describe, expect, it } from "vitest";
import { blocksToTiptap } from "./fromBlocks";
import type { Block } from "@/lib/gemini/schemas";

describe("blocksToTiptap", () => {
  it("groups consecutive bullet blocks into a single bulletList", () => {
    const blocks: Block[] = [
      { type: "heading1", text: "Jane Doe" },
      { type: "paragraph", text: "Software Engineer" },
      { type: "bullet", text: "Built things" },
      { type: "bullet", text: "Shipped stuff" },
      { type: "paragraph", text: "Closing line" },
    ];

    const doc = blocksToTiptap(blocks);

    expect(doc).toEqual({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Jane Doe" }] },
        { type: "paragraph", content: [{ type: "text", text: "Software Engineer" }] },
        {
          type: "bulletList",
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Built things" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Shipped stuff" }] }] },
          ],
        },
        { type: "paragraph", content: [{ type: "text", text: "Closing line" }] },
      ],
    });
  });

  it("falls back to a single empty paragraph for an empty block list", () => {
    expect(blocksToTiptap([])).toEqual({
      type: "doc",
      content: [{ type: "paragraph", content: [] }],
    });
  });
});
