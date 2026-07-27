import type { NormalizedJobPosting } from "../types";

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  updated_at: string;
  first_published: string | null;
  location: { name: string } | null;
  content?: string;
  metadata?: { name: string; value: unknown }[] | null;
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

// Greenhouse's `content` field is HTML-encoded (literal "&lt;div&gt;", not
// "<div>"), so entities must be decoded before tags can be stripped -- doing
// it in the other order leaves the encoded tags as visible text.
function stripHtml(html: string): string {
  const decoded = html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
  return decoded
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isRemote(job: GreenhouseJob): boolean {
  const workplaceType = job.metadata?.find((m) => /workplace/i.test(m.name))?.value;
  if (typeof workplaceType === "string" && /remote/i.test(workplaceType)) return true;
  return /remote/i.test(job.location?.name ?? "");
}

// Greenhouse's public job board API -- no auth required, one company per
// board token. https://developers.greenhouse.io/job-board.html
export async function fetchGreenhouseJobs(
  boardToken: string,
  companyName: string,
): Promise<NormalizedJobPosting[]> {
  const response = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`,
  );
  if (!response.ok) {
    throw new Error(`Greenhouse fetch failed for ${boardToken}: ${response.status}`);
  }
  const data = (await response.json()) as GreenhouseResponse;

  return data.jobs.map((job) => ({
    externalId: String(job.id),
    company: companyName,
    title: job.title,
    location: job.location?.name?.trim() || null,
    remote: isRemote(job),
    description: job.content ? stripHtml(job.content) : null,
    url: job.absolute_url,
    postedAt: job.first_published ?? job.updated_at ?? null,
  }));
}
