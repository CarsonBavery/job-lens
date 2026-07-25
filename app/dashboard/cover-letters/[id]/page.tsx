import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocument } from "@/lib/documents/db";
import { updateCoverLetterContent } from "@/lib/cover-letters/actions";
import { DocumentEditor } from "@/components/editor/DocumentEditor";

export default async function CoverLetterEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const coverLetter = await getDocument(supabase, "cover_letters", id);
  if (!coverLetter) notFound();

  return (
    <DocumentEditor
      documentId={coverLetter.id}
      initialTitle={coverLetter.title}
      initialContent={coverLetter.content}
      onSave={updateCoverLetterContent}
      backHref="/dashboard/cover-letters"
      exportHref={`/api/cover-letters/${coverLetter.id}/export`}
    />
  );
}
