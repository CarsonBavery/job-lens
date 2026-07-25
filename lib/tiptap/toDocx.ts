import {
  AlignmentType,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { JSONContent } from "@tiptap/react";

const HEADING_LEVELS: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
};

const ORDERED_LIST_REFERENCE = "joblens-ordered-list";

function textRunsFrom(node: JSONContent): TextRun[] {
  if (node.type !== "text") return [];
  const marks = new Set((node.marks ?? []).map((mark) => mark.type));
  return [
    new TextRun({
      text: node.text ?? "",
      bold: marks.has("bold"),
      italics: marks.has("italic"),
      strike: marks.has("strike"),
    }),
  ];
}

function paragraphsFromListItem(item: JSONContent, ordered: boolean): Paragraph[] {
  return (item.content ?? []).flatMap((child): Paragraph[] => {
    if (child.type !== "paragraph") return paragraphsFrom(child);
    return [
      new Paragraph({
        bullet: ordered ? undefined : { level: 0 },
        numbering: ordered ? { reference: ORDERED_LIST_REFERENCE, level: 0 } : undefined,
        children: (child.content ?? []).flatMap(textRunsFrom),
      }),
    ];
  });
}

function paragraphsFrom(node: JSONContent): Paragraph[] {
  switch (node.type) {
    case "paragraph":
      return [new Paragraph({ children: (node.content ?? []).flatMap(textRunsFrom) })];
    case "heading": {
      const level = HEADING_LEVELS[(node.attrs?.level as number) ?? 1] ?? HeadingLevel.HEADING_1;
      return [
        new Paragraph({ heading: level, children: (node.content ?? []).flatMap(textRunsFrom) }),
      ];
    }
    case "bulletList":
      return (node.content ?? []).flatMap((item) => paragraphsFromListItem(item, false));
    case "orderedList":
      return (node.content ?? []).flatMap((item) => paragraphsFromListItem(item, true));
    case "codeBlock":
      return [
        new Paragraph({
          children: [new TextRun({ text: node.content?.[0]?.text ?? "", font: "Courier New" })],
        }),
      ];
    case "horizontalRule":
      return [new Paragraph({ text: "" })];
    default:
      // blockquote and any unrecognized wrapper: recurse into its children.
      return (node.content ?? []).flatMap(paragraphsFrom);
  }
}

// Renders a Tiptap/ProseMirror document (from resumes.content / cover_letters.content)
// to a real .docx file buffer for download.
export async function tiptapJsonToDocxBuffer(doc: JSONContent, title: string): Promise<Buffer> {
  const children = (doc.content ?? []).flatMap(paragraphsFrom);

  const document = new Document({
    numbering: {
      config: [
        {
          reference: ORDERED_LIST_REFERENCE,
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: children.length > 0 ? children : [new Paragraph({ text: title })],
      },
    ],
  });

  return Packer.toBuffer(document);
}
