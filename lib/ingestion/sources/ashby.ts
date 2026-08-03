import type { NormalizedJobPosting } from "../types";

interface AshbyJob {
  id: string;
  title: string;
  location: string | null;
  // Despite Ashby's docs implying this is always a boolean, real postings
  // have been observed with it missing/null (confirmed live: 10/104 Vanta
  // postings, all EMEA roles without a clear remote/onsite designation) --
  // passing that straight through violated job_postings.remote's NOT NULL
  // constraint. Don't trust this field to always be present.
  isRemote?: boolean | null;
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
      remote: job.isRemote ?? false,
      description: job.descriptionPlain?.trim() || null,
      url: job.jobUrl,
      postedAt: job.publishedAt,
      // Ashby's unauthenticated public job-board API has no structured
      // department/team field -- categorize.ts falls back to title/
      // description keywords for this source.
      departmentHint: null,
    }));
}
