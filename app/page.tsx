import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">JobLens</h1>
      <p className="max-w-xl text-lg text-gray-600 dark:text-gray-400">
        AI-tailored resumes and cover letters, application tracking, and a deduplicated job
        board — all in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90"
        >
          Get started free
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
