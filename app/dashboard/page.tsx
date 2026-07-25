import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { baseDocumentLimit, countBaseDocuments, type SubscriptionTier } from "@/lib/documents/db";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // layout already redirects unauthenticated users

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();
  const tier = (profile?.subscription_tier ?? "free") as SubscriptionTier;

  const [resumeCount, coverLetterCount] = await Promise.all([
    countBaseDocuments(supabase, "resumes", user.id),
    countBaseDocuments(supabase, "cover_letters", user.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/resumes"
          className="rounded-lg border border-gray-200 p-6 transition-colors hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
        >
          <p className="text-sm text-gray-500">Resumes</p>
          <p className="text-3xl font-semibold">
            {resumeCount} / {baseDocumentLimit("resumes", tier)}
          </p>
        </Link>
        <Link
          href="/dashboard/cover-letters"
          className="rounded-lg border border-gray-200 p-6 transition-colors hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
        >
          <p className="text-sm text-gray-500">Cover Letters</p>
          <p className="text-3xl font-semibold">
            {coverLetterCount} / {baseDocumentLimit("cover_letters", tier)}
          </p>
        </Link>
      </div>

      <p className="text-sm text-gray-500">
        Plan: <span className="font-medium capitalize">{tier}</span>
      </p>
    </div>
  );
}
