import Link from "next/link";
import { Sparkles, ClipboardCheck, SearchCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobCategoryBadge } from "@/components/jobs/JobCategoryBadge";
import { SiteHeader } from "@/components/layout/SiteHeader";

const FEATURES = [
  {
    icon: SearchCheck,
    title: "Categorized STEM search",
    description:
      "Postings pulled directly from company ATS platforms, deduplicated across sources, and tagged by discipline -- software, data/ML, hardware, biotech, and more.",
  },
  {
    icon: Sparkles,
    title: "AI resume and cover letter tailoring",
    description:
      "Gemini rewrites your resume and cover letter for a specific listing, without inventing experience you don't have -- one click from any search result.",
  },
  {
    icon: ClipboardCheck,
    title: "Application tracking",
    description:
      "Save jobs, track status from applied to offer, and get notified the moment a saved posting closes.",
  },
];

const PREVIEW_LISTINGS = [
  { title: "Senior Backend Engineer", company: "Cloudflare", category: "software" as const, meta: "Remote — $180k–220k" },
  { title: "Machine Learning Engineer", company: "Anthropic", category: "data_ml" as const, meta: "San Francisco — $210k–260k" },
  { title: "Research Associate, Genomics", company: "Ginkgo Bioworks", category: "biotech" as const, meta: "Boston, MA" },
  { title: "Robotics Software Engineer", company: "Skydio", category: "hardware" as const, meta: "Redwood City, CA" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col">
        <section className="grid w-full max-w-6xl items-center gap-10 self-center px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col gap-6">
            <Badge variant="outline" className="w-fit border-primary/30 bg-accent px-3 py-1 text-accent-foreground">
              Free plan · 3 resumes + 1 cover letter, no card required
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Search real STEM jobs, <span className="text-primary">categorized by discipline</span>
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground text-balance">
              Software, data/ML, hardware, biotech, and infrastructure roles aggregated directly
              from company ATS platforms and deduplicated across sources. Create a free account to
              search, then tailor your resume and cover letter for any listing with Gemini.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/signup">Create a free account</Link>} />
              <Button size="lg" variant="outline" render={<Link href="/login">Sign in</Link>} />
            </div>
          </div>

          <Card className="w-full" aria-label="Example of categorized search results">
            <CardContent className="flex flex-col gap-1">
              {PREVIEW_LISTINGS.map((job) => (
                <div
                  key={job.title}
                  className="flex flex-col gap-1 border-b border-border py-3 last:border-0 last:pb-0 first:pt-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{job.title}</span>
                    <JobCategoryBadge category={job.category} />
                  </div>
                  <p className="font-mono text-sm text-muted-foreground">
                    {job.company} — {job.meta}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid w-full max-w-5xl gap-4 self-center px-6 pb-24 sm:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Card key={feature.title}>
              <CardContent className="flex flex-col gap-3">
                <span
                  className="flex size-10 items-center justify-center rounded-md"
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
    </div>
  );
}
