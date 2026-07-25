import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocument } from "@/lib/documents/db";
import { updateResumeContent } from "@/lib/resumes/actions";
import { DocumentEditor } from "@/components/editor/DocumentEditor";

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const resume = await getDocument(supabase, "resumes", id);
  if (!resume) notFound();

  return (
    <DocumentEditor
      documentId={resume.id}
      initialTitle={resume.title}
      initialContent={resume.content}
      onSave={updateResumeContent}
      backHref="/dashboard/resumes"
      exportHref={`/api/resumes/${resume.id}/export`}
    />
  );
}
