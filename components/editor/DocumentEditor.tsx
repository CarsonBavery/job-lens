"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorToolbar } from "./EditorToolbar";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function DocumentEditor({
  documentId,
  initialTitle,
  initialContent,
  onSave,
  backHref,
  exportHref,
}: {
  documentId: string;
  initialTitle: string;
  initialContent: JSONContent;
  onSave: (id: string, content: JSONContent, title: string) => Promise<void>;
  backHref: string;
  exportHref: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [, startTransition] = useTransition();
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef(title);
  titleRef.current = title;

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "tiptap min-h-[600px] focus:outline-none" },
    },
    onUpdate: () => scheduleSave(),
  });

  const scheduleSave = useCallback(() => {
    setStatus("saving");
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      if (!editor) return;
      const content = editor.getJSON();
      startTransition(async () => {
        try {
          await onSave(documentId, content, titleRef.current);
          setStatus("saved");
        } catch {
          setStatus("error");
        }
      });
    }, 1000);
  }, [editor, documentId, onSave]);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link href={backHref} className="text-sm text-gray-500 hover:text-foreground">
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {status === "saving" && "Saving…"}
            {status === "saved" && "Saved"}
            {status === "error" && "Failed to save"}
          </span>
          <a
            href={exportHref}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Export .docx
          </a>
        </div>
      </div>

      <input
        data-testid="document-title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          scheduleSave();
        }}
        className="w-full border-b border-transparent bg-transparent text-2xl font-semibold outline-none focus:border-gray-300"
      />

      {editor && <EditorToolbar editor={editor} />}

      <div className="rounded-md border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
