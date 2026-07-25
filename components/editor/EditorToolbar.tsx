"use client";

import type { Editor } from "@tiptap/react";

const buttonClass = (active: boolean) =>
  `rounded px-2 py-1 text-sm font-medium ${
    active ? "bg-foreground text-background" : "hover:bg-gray-100 dark:hover:bg-gray-800"
  }`;

export function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="mb-3 flex flex-wrap gap-1 border-b border-gray-200 pb-3 dark:border-gray-800">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive("bold"))}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive("italic"))}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive("strike"))}
      >
        Strike
      </button>
      <span className="mx-1 w-px bg-gray-200 dark:bg-gray-800" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 1 }))}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 2 }))}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 3 }))}
      >
        H3
      </button>
      <span className="mx-1 w-px bg-gray-200 dark:bg-gray-800" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive("bulletList"))}
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive("orderedList"))}
      >
        Numbered List
      </button>
    </div>
  );
}
