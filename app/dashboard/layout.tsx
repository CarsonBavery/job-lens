import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <Link href="/dashboard" className="font-semibold">
          JobLens
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard/resumes" className="hover:underline">
            Resumes
          </Link>
          <Link href="/dashboard/cover-letters" className="hover:underline">
            Cover Letters
          </Link>
          <Link href="/dashboard/jobs" className="hover:underline">
            Jobs
          </Link>
          <Link href="/dashboard/profile" className="hover:underline">
            Profile
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-gray-500 hover:text-foreground">
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
