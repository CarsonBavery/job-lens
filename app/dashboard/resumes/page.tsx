import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  baseDocumentLimit,
  countBaseDocuments,
  listBaseDocuments,
  type SubscriptionTier,
} from "@/lib/documents/db";
import { createResume, deleteResume } from "@/lib/resumes/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button";

export default async function ResumesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();
  const tier = (profile?.subscription_tier ?? "free") as SubscriptionTier;

  const [resumes, count] = await Promise.all([
    listBaseDocuments(supabase, "resumes", user.id),
    countBaseDocuments(supabase, "resumes", user.id),
  ]);
  const limit = baseDocumentLimit("resumes", tier);
  const atLimit = count >= limit;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resumes</h1>
        <span className="text-sm text-muted-foreground">
          {count} / {limit} used
        </span>
      </div>

      {error === "limit" && (
        <Alert>
          <AlertDescription>
            You&apos;ve reached your {tier} tier limit of {limit} resumes. Upgrade to add more.
          </AlertDescription>
        </Alert>
      )}

      <form action={createResume} className="flex gap-2">
        <Input
          name="title"
          placeholder="e.g. Frontend Engineer"
          className="flex-1"
          disabled={atLimit}
        />
        <Button type="submit" disabled={atLimit}>
          New Resume
        </Button>
      </form>

      <Card className="divide-y py-0">
        {resumes.map((resume) => (
          <div key={resume.id} className="flex items-center justify-between px-4 py-3">
            <Link href={`/dashboard/resumes/${resume.id}`} className="font-medium hover:underline">
              {resume.title}
            </Link>
            <div className="flex items-center gap-3">
              <a
                href={`/api/resumes/${resume.id}/export`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Export .docx
              </a>
              <form id={`delete-resume-${resume.id}`} action={deleteResume}>
                <input type="hidden" name="id" value={resume.id} />
              </form>
              <DeleteConfirmButton
                formId={`delete-resume-${resume.id}`}
                itemLabel="resume"
                size="sm"
                className="text-destructive"
              />
            </div>
          </div>
        ))}
        {resumes.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">No resumes yet.</p>
        )}
      </Card>
    </div>
  );
}
