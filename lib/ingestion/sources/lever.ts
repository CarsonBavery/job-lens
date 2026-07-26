import type { NormalizedJobPosting } from "../types";

interface LeverPosting {
  id: string;
  text: string;
  categories?: { location?: string; team?: string; commitment?: string };
  workplaceType?: string; // "remote" | "hybrid" | "on-site"
  hostedUrl: string;
  createdAt: number; // epoch millis
  descriptionPlain?: string;
}

// Lever's public postings API -- no auth required.
// https://github.com/lever/postings-api
export async function fetchLeverJobs(
  company: string,
  companyName: string,
): Promise<NormalizedJobPosting[]> {
  const response = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`);
  if (!response.ok) {
    throw new Error(`Lever fetch failed for ${company}: ${response.status}`);
  }
  const data = (await response.json()) as LeverPosting[] | { ok: false; error: string };
  if (!Array.isArray(data)) {
    throw new Error(`Lever fetch failed for ${company}: ${data.error}`);
  }

  return data.map((job) => ({
    externalId: job.id,
    company: companyName,
    title: job.text,
    location: job.categories?.location?.trim() || null,
    remote:
      job.workplaceType === "remote" || /remote/i.test(job.categories?.location ?? ""),
    description: job.descriptionPlain?.trim() || null,
    url: job.hostedUrl,
    postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : null,
  }));
}
