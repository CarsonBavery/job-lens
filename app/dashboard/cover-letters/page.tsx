import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  baseDocumentLimit,
  countBaseDocuments,
  listBaseDocuments,
  type SubscriptionTier,
} from "@/lib/documents/db";
import { createCoverLetter, deleteCoverLetter } from "@/lib/cover-letters/actions";
import { GenerateCoverLetterForm } from "@/components/editor/GenerateCoverLetterForm";

export default async function CoverLettersPage({
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

  const [coverLetters, count, resumes] = await Promise.all([
    listBaseDocuments(supabase, "cover_letters", user.id),
    countBaseDocuments(supabase, "cover_letters", user.id),
    listBaseDocuments(supabase, "resumes", user.id),
  ]);
  const limit = baseDocumentLimit("cover_letters", tier);
  const atLimit = count >= limit;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cover Letters</h1>
        <span className="text-sm text-gray-500">
          {count} / {limit} used
        </span>
      </div>

      {error === "limit" && (
        <p className="rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          You&apos;ve reached your {tier} tier limit of {limit} cover letter
          {limit === 1 ? "" : "s"}. Upgrade to add more.
        </p>
      )}

      <form action={createCoverLetter} className="flex gap-2">
        <input
          name="title"
          placeholder="e.g. General Cover Letter"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
          disabled={atLimit}
        />
        <button
          type="submit"
          disabled={atLimit}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          New Cover Letter
        </button>
      </form>

      <ul className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
        {coverLetters.map((coverLetter) => (
          <li key={coverLetter.id} className="flex items-center justify-between py-3">
            <Link
              href={`/dashboard/cover-letters/${coverLetter.id}`}
              className="font-medium hover:underline"
            >
              {coverLetter.title}
            </Link>
            <div className="flex items-center gap-3">
              <a
                href={`/api/cover-letters/${coverLetter.id}/export`}
                className="text-sm text-gray-500 hover:text-foreground"
              >
                Export .docx
              </a>
              <form action={deleteCoverLetter}>
                <input type="hidden" name="id" value={coverLetter.id} />
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
        {coverLetters.length === 0 && (
          <p className="py-6 text-sm text-gray-500">No cover letters yet.</p>
        )}
      </ul>

      <GenerateCoverLetterForm resumes={resumes.map((r) => ({ id: r.id, title: r.title }))} />
    </div>
  );
}
