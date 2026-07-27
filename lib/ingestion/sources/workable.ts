import type { NormalizedJobPosting } from "../types";

interface WorkableJob {
  id: string;
  title: string;
  url: string;
  shortlink?: string;
  telecommute?: boolean;
  city?: string;
  country?: string;
  state?: string;
  created_at?: string;
}

interface WorkableResponse {
  name: string;
  jobs: WorkableJob[];
}

function formatLocation(job: WorkableJob): string | null {
  const parts = [job.city, job.state, job.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

// Workable's public widget API -- no auth required. Unlike the other three
// sources, the list endpoint doesn't include a job description (that needs
// a separate per-job detail call this connector doesn't make, to avoid an
// N+1 request pattern for an unverified endpoint) -- description is always
// null here.
export async function fetchWorkableJobs(
  account: string,
  companyName: string,
): Promise<NormalizedJobPosting[]> {
  const response = await fetch(`https://apply.workable.com/api/v1/widget/accounts/${account}`);
  if (!response.ok) {
    throw new Error(`Workable fetch failed for ${account}: ${response.status}`);
  }
  const data = (await response.json()) as WorkableResponse;

  return data.jobs.map((job) => ({
    externalId: job.id,
    company: companyName,
    title: job.title,
    location: formatLocation(job),
    remote: job.telecommute ?? false,
    description: null,
    url: job.shortlink || job.url,
    postedAt: job.created_at ?? null,
  }));
}
