import { redirect } from "next/navigation";

// Job search is now the app's primary surface (see CLAUDE.md) -- the old
// resume/cover-letter-count overview this page used to render moved to
// components/dashboard/AccountSummaryStrip.tsx, shown above the search form
// on /dashboard/jobs instead of being the landing page itself.
export default function DashboardPage() {
  redirect("/dashboard/jobs");
}
