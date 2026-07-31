import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { baseDocumentLimit, countBaseDocuments, type SubscriptionTier } from "@/lib/documents/db";
import { Badge } from "@/components/ui/badge";

// Compact stand-in for the old /dashboard overview page, now that job
// search is the landing surface (see app/dashboard/page.tsx's redirect) --
// keeps the tier/doc-count visibility without it being the first thing a
// user sees after signing in.
export async function AccountSummaryStrip() {
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

  const [resumeCount, coverLetterCount] = await Promise.all([
    countBaseDocuments(supabase, "resumes", user.id),
    countBaseDocuments(supabase, "cover_letters", user.id),
  ]);

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      <Badge variant="secondary" className="capitalize">
        {tier} plan
      </Badge>
      <Link href="/dashboard/resumes" className="hover:text-foreground">
        {resumeCount} / {baseDocumentLimit("resumes", tier)} resumes
      </Link>
      <Link href="/dashboard/cover-letters" className="hover:text-foreground">
        {coverLetterCount} / {baseDocumentLimit("cover_letters", tier)} cover letters
      </Link>
    </div>
  );
}
