import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { baseDocumentLimit, countBaseDocuments, type SubscriptionTier } from "@/lib/documents/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Badge variant="secondary" className="capitalize">
          {tier} plan
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/resumes">
          <Card className="transition-colors hover:ring-primary/40">
            <CardContent>
              <p className="text-sm text-muted-foreground">Resumes</p>
              <p className="text-3xl font-semibold">
                {resumeCount} / {baseDocumentLimit("resumes", tier)}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/cover-letters">
          <Card className="transition-colors hover:ring-primary/40">
            <CardContent>
              <p className="text-sm text-muted-foreground">Cover Letters</p>
              <p className="text-3xl font-semibold">
                {coverLetterCount} / {baseDocumentLimit("cover_letters", tier)}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
