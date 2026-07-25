import { describe, expect, it } from "vitest";
import { tiptapToPlainText } from "./toPlainText";

describe("tiptapToPlainText", () => {
  it("flattens headings, paragraphs, and bullet lists into lines", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Jane Doe" }] },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Software Engineer" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Built things" }] }],
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Shipped stuff" }] }],
            },
          ],
        },
      ],
    };

    expect(tiptapToPlainText(doc)).toBe(
      "Jane Doe\nSoftware Engineer\n- Built things\n- Shipped stuff",
    );
  });

  it("skips empty paragraphs", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [] },
        { type: "paragraph", content: [{ type: "text", text: "Hello" }] },
      ],
    };
    expect(tiptapToPlainText(doc)).toBe("Hello");
  });
});
