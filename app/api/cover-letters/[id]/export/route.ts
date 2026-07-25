import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDocument } from "@/lib/documents/db";
import { tiptapJsonToDocxBuffer } from "@/lib/tiptap/toDocx";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const coverLetter = await getDocument(supabase, "cover_letters", id);
  if (!coverLetter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await tiptapJsonToDocxBuffer(coverLetter.content, coverLetter.title);
  const fileName = `${coverLetter.title.replace(/[^a-z0-9]+/gi, "-")}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
