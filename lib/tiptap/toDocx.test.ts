import { describe, expect, it } from "vitest";
import { tiptapJsonToDocxBuffer } from "./toDocx";

describe("tiptapJsonToDocxBuffer", () => {
  it("renders headings, marks, and both list types into a valid docx buffer", async () => {
    const doc = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Jane Doe" }] },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Software Engineer", marks: [{ type: "bold" }] }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Built things" }] }],
            },
          ],
        },
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Step one" }] }],
            },
          ],
        },
      ],
    };

    const buffer = await tiptapJsonToDocxBuffer(doc, "Jane Doe Resume");
    expect(buffer.byteLength).toBeGreaterThan(0);
    // .docx files are zip archives; the local file header signature is "PK".
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
  });

  it("falls back to the title paragraph when the document has no content", async () => {
    const buffer = await tiptapJsonToDocxBuffer({ type: "doc", content: [] }, "Untitled");
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});
