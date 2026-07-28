import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

const FEATURES = [
  {
    title: "AI-tailored documents",
    description:
      "Gemini rewrites your resume and cover letter for each specific job posting, without inventing experience you don't have.",
  },
  {
    title: "Deduplicated job board",
    description:
      "Postings pulled directly from company ATS platforms, matched to your resume, with stale listings automatically cleared out.",
  },
  {
    title: "Application tracking",
    description:
      "Save jobs, track status from applied to offer, and get notified the moment a saved posting closes.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <section className="flex w-full max-w-3xl flex-col items-center gap-6 px-6 pt-24 pb-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
          J
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">JobLens</h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          AI-tailored resumes and cover letters, application tracking, and a deduplicated job
          board — all in one place.
        </p>
        <div className="flex gap-3">
          <Button size="lg" render={<Link href="/signup">Get started free</Link>} />
          <Button size="lg" variant="outline" render={<Link href="/login">Sign in</Link>} />
        </div>
      </section>

      <section className="grid w-full max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="flex flex-col gap-2">
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
