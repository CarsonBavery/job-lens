import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocument, listTailoredDocuments } from "@/lib/documents/db";
import { updateResumeContent } from "@/lib/resumes/actions";
import { DocumentEditor } from "@/components/editor/DocumentEditor";
import { TailorResumeForm } from "@/components/editor/TailorResumeForm";
import { TailoredVersionsList } from "@/components/editor/TailoredVersionsList";

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const resume = await getDocument(supabase, "resumes", id);
  if (!resume) notFound();

  const tailoredVersions = await listTailoredDocuments(
    supabase,
    "resumes",
    "base_resume_id",
    resume.id,
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <DocumentEditor
        documentId={resume.id}
        initialTitle={resume.title}
        initialContent={resume.content}
        onSave={updateResumeContent}
        backHref="/dashboard/resumes"
        exportHref={`/api/resumes/${resume.id}/export`}
      />
      <TailorResumeForm resumeId={resume.id} />
      <TailoredVersionsList versions={tailoredVersions} hrefPrefix="/dashboard/resumes" />
    </div>
  );
}
