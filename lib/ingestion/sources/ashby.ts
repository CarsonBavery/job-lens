import type { NormalizedJobPosting } from "../types";

interface AshbyJob {
  id: string;
  title: string;
  location: string | null;
  isRemote: boolean;
  isListed: boolean;
  publishedAt: string | null;
  jobUrl: string;
  descriptionPlain?: string;
}

interface AshbyResponse {
  jobs: AshbyJob[];
}

// Ashby's public job board API -- no auth required.
// https://developers.ashbyhq.com/reference/jobpostingapi
export async function fetchAshbyJobs(
  boardName: string,
  companyName: string,
): Promise<NormalizedJobPosting[]> {
  const response = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${boardName}`);
  if (!response.ok) {
    throw new Error(`Ashby fetch failed for ${boardName}: ${response.status}`);
  }
  const data = (await response.json()) as AshbyResponse;

  return data.jobs
    .filter((job) => job.isListed)
    .map((job) => ({
      externalId: job.id,
      company: companyName,
      title: job.title,
      location: job.location?.trim() || null,
      remote: job.isRemote,
      description: job.descriptionPlain?.trim() || null,
      url: job.jobUrl,
      postedAt: job.publishedAt,
    }));
}
