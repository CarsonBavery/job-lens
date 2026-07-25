import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocument, listTailoredDocuments } from "@/lib/documents/db";
import { updateCoverLetterContent } from "@/lib/cover-letters/actions";
import { DocumentEditor } from "@/components/editor/DocumentEditor";
import { TailoredVersionsList } from "@/components/editor/TailoredVersionsList";

export default async function CoverLetterEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const coverLetter = await getDocument(supabase, "cover_letters", id);
  if (!coverLetter) notFound();

  const tailoredVersions = await listTailoredDocuments(
    supabase,
    "cover_letters",
    "base_cover_letter_id",
    coverLetter.id,
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <DocumentEditor
        documentId={coverLetter.id}
        initialTitle={coverLetter.title}
        initialContent={coverLetter.content}
        onSave={updateCoverLetterContent}
        backHref="/dashboard/cover-letters"
        exportHref={`/api/cover-letters/${coverLetter.id}/export`}
      />
      <TailoredVersionsList versions={tailoredVersions} hrefPrefix="/dashboard/cover-letters" />
    </div>
  );
}
