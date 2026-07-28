import Link from "next/link";
import { Sparkles, SearchCheck, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/layout/SiteHeader";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-tailored documents",
    description:
      "Gemini rewrites your resume and cover letter for each specific job posting, without inventing experience you don't have.",
  },
  {
    icon: SearchCheck,
    title: "Deduplicated job board",
    description:
      "Postings pulled directly from company ATS platforms, matched to your resume, with stale listings automatically cleared out.",
  },
  {
    icon: ClipboardCheck,
    title: "Application tracking",
    description:
      "Save jobs, track status from applied to offer, and get notified the moment a saved posting closes.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />

      <section className="flex w-full max-w-3xl flex-col items-center gap-6 self-center px-6 pt-20 pb-16 text-center">
        <Badge variant="outline" className="border-primary/30 bg-accent px-3 py-1 text-accent-foreground">
          Free plan · 3 resumes + 1 cover letter, no card required
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight text-balance sm:text-6xl">
          Your job search, <span className="text-primary">made a little easier</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground text-balance">
          AI-tailored resumes and cover letters, a job board that&apos;s already deduplicated for you,
          and application tracking that actually tells you when something changes.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" render={<Link href="/signup">Get started free</Link>} />
          <Button size="lg" variant="outline" render={<Link href="/login">Sign in</Link>} />
        </div>
      </section>

      <section className="grid w-full max-w-5xl gap-4 self-center px-6 pb-24 sm:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <Card key={feature.title}>
            <CardContent className="flex flex-col gap-3">
              <span
                className="flex size-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `var(--chart-${(i % 5) + 1})`,
                  color: "var(--primary-foreground)",
                }}
              >
                <feature.icon className="size-5" />
              </span>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
