import type { JSONContent } from "@tiptap/react";
import type { Block } from "@/lib/gemini/schemas";

const HEADING_LEVEL: Record<string, number> = {
  heading1: 1,
  heading2: 2,
  heading3: 3,
};

function paragraphNode(text: string): JSONContent {
  return { type: "paragraph", content: text ? [{ type: "text", text }] : [] };
}

// Converts Gemini's flat block list (see lib/gemini/schemas.ts) into a
// Tiptap/ProseMirror document, grouping consecutive "bullet" blocks into a
// single bulletList so the editor renders real list markup.
export function blocksToTiptap(blocks: Block[]): JSONContent {
  const content: JSONContent[] = [];
  let pendingBullets: JSONContent[] = [];

  const flushBullets = () => {
    if (pendingBullets.length === 0) return;
    content.push({ type: "bulletList", content: pendingBullets });
    pendingBullets = [];
  };

  for (const block of blocks) {
    if (block.type === "bullet") {
      pendingBullets.push({ type: "listItem", content: [paragraphNode(block.text)] });
      continue;
    }
    flushBullets();
    if (block.type === "paragraph") {
      content.push(paragraphNode(block.text));
    } else {
      content.push({
        type: "heading",
        attrs: { level: HEADING_LEVEL[block.type] },
        content: block.text ? [{ type: "text", text: block.text }] : [],
      });
    }
  }
  flushBullets();

  return { type: "doc", content: content.length > 0 ? content : [paragraphNode("")] };
}
