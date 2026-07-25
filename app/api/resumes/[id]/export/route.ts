import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDocument } from "@/lib/documents/db";
import { tiptapJsonToDocxBuffer } from "@/lib/tiptap/toDocx";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // RLS scopes this to the signed-in user's own rows; a doc that isn't
  // theirs (or doesn't exist) comes back null, same as a 404.
  const resume = await getDocument(supabase, "resumes", id);
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await tiptapJsonToDocxBuffer(resume.content, resume.title);
  const fileName = `${resume.title.replace(/[^a-z0-9]+/gi, "-")}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
