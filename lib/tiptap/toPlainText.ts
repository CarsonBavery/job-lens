import type { JSONContent } from "@tiptap/react";

function textFrom(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(textFrom).join("");
}

function linesFrom(node: JSONContent, prefix = ""): string[] {
  switch (node.type) {
    case "paragraph":
    case "heading":
      return [prefix + textFrom(node)];
    case "bulletList":
    case "orderedList":
      return (node.content ?? []).flatMap((item) => linesFrom(item, "- "));
    case "listItem":
      return (node.content ?? []).flatMap((child) => linesFrom(child, prefix));
    default:
      return (node.content ?? []).flatMap((child) => linesFrom(child, prefix));
  }
}

// Flattens a Tiptap/ProseMirror document into plain text, used to give
// Gemini a resume's current content as context. Lossy by design -- this is
// for feeding an LLM a prompt, not for round-tripping back into the editor.
export function tiptapToPlainText(doc: JSONContent): string {
  return (doc.content ?? [])
    .flatMap((node) => linesFrom(node))
    .filter((line) => line.trim().length > 0)
    .join("\n");
}
