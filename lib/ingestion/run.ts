import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { SEED_COMPANIES, type CompanyConfig } from "./companies";
import { fetchGreenhouseJobs } from "./sources/greenhouse";
import { fetchLeverJobs } from "./sources/lever";
import { fetchAshbyJobs } from "./sources/ashby";
import { fetchWorkableJobs } from "./sources/workable";
import { buildDedupKey } from "./normalize";
import { embedJobPostingTexts } from "./embed";
import { resolveDedupGroup } from "./dedup";
import type { NormalizedJobPosting } from "./types";
import { listApplicationsForJobPostings } from "@/lib/applications/db";
import { createNotification } from "@/lib/notifications/db";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface IngestionSummary {
  company: string;
  source: string;
  fetched: number;
  upserted: number;
  closed: number;
  errors: string[];
}

// Pure diff, unit-tested in isolation (the DB round-trip it feeds into is
// covered by the e2e ingestion test instead) -- a posting that was active
// last run but didn't come back in this run's fetch is treated as closed
// (filled/pulled by the company). Only ever called after a successful
// fetch: a transient fetch failure must not be mistaken for "the company
// has zero open roles now," or one bad network blip would wrongly close
// every posting for that company.
export function determineClosedExternalIds(
  previouslyActiveIds: string[],
  fetchedIds: string[],
): string[] {
  const fetchedSet = new Set(fetchedIds);
  return previouslyActiveIds.filter((id) => !fetchedSet.has(id));
}

// Supabase's PostgrestError (and similar) are plain objects with a
// `message` field, not `instanceof Error` -- `err instanceof Error ?
// err.message : String(err)` collapses those to the useless literal
// "[object Object]", which is exactly what hid a real bug (10/104 Vanta
// postings failing) during a live Phase 3 timing run until this was fixed.
function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

// Any user with a saved/applied application pointing at one of these
// postings gets an in-app notification -- their application isn't
// deleted, just moved out of the "active" board view (see
// app/dashboard/applications/page.tsx). Failures here are logged, not
// thrown: a notification glitch shouldn't fail the whole ingestion run
// after the actual posting-status update already succeeded.
async function notifyClosedPostings(
  supabase: SupabaseClient<Database>,
  closedPostings: { id: string; title: string; company: string }[],
): Promise<void> {
  try {
    const applications = await listApplicationsForJobPostings(
      supabase,
      closedPostings.map((p) => p.id),
    );
    const postingById = new Map(closedPostings.map((p) => [p.id, p]));
    for (const application of applications) {
      const posting = application.job_posting_id ? postingById.get(application.job_posting_id) : undefined;
      if (!posting) continue;
      await createNotification(supabase, {
        userId: application.user_id,
        message: `${posting.title} at ${posting.company} is no longer available.`,
        applicationId: application.id,
      });
    }
  } catch (err) {
    console.error("Failed to notify users about closed postings:", errorMessage(err));
  }
}

function embeddingTextFor(posting: NormalizedJobPosting): string {
  return [posting.title, posting.location, posting.description]
    .filter(Boolean)
    .join("\n")
    .slice(0, 4000);
}

async function fetchForSourceOnce(config: CompanyConfig): Promise<NormalizedJobPosting[]> {
  switch (config.source) {
    case "greenhouse":
      return fetchGreenhouseJobs(config.token, config.companyName);
    case "lever":
      return fetchLeverJobs(config.token, config.companyName);
    case "ashby":
      return fetchAshbyJobs(config.token, config.companyName);
    case "workable":
      return fetchWorkableJobs(config.token, config.companyName);
  }
}

// Transient "fetch failed" (DNS/connection blips) has been observed live
// against every one of these 4 ATS APIs during Phase 3 testing -- not a
// hypothetical edge case. A production cron job hitting this shouldn't
// silently skip an entire company until its next 6-hourly run over what's
// usually a one-off network hiccup, so retry once after a short delay
// before giving up.
async function fetchForSource(config: CompanyConfig): Promise<NormalizedJobPosting[]> {
  try {
    return await fetchForSourceOnce(config);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return fetchForSourceOnce(config);
  }
}

// Runs the full ingestion pass: fetch each configured company's postings,
// normalize, embed (batched per company -- see embed.ts), upsert
// (source_id + external_id identifies a posting uniquely, so re-running
// this is safe), and resolve cross-source dedup groups. Uses the
// service-role client because job_postings only grants public SELECT --
// writes require bypassing RLS.
export async function runIngestion(
  companies: CompanyConfig[] = SEED_COMPANIES,
): Promise<IngestionSummary[]> {
  const supabase = createServiceRoleClient();

  const { data: sources, error: sourcesError } = await supabase
    .from("job_sources")
    .select("id, name");
  if (sourcesError) throw sourcesError;
  const sourceIdByName = new Map(sources.map((s) => [s.name, s.id]));

  const summaries: IngestionSummary[] = [];

  for (const config of companies) {
    const summary: IngestionSummary = {
      company: config.companyName,
      source: config.source,
      fetched: 0,
      upserted: 0,
      closed: 0,
      errors: [],
    };

    const sourceId = sourceIdByName.get(config.source);
    if (!sourceId) {
      summary.errors.push(`Unknown source "${config.source}" -- not seeded in job_sources`);
      summaries.push(summary);
      continue;
    }

    let postings: NormalizedJobPosting[];
    try {
      postings = await fetchForSource(config);
    } catch (err) {
      summary.errors.push(errorMessage(err));
      summaries.push(summary);
      continue;
    }
    summary.fetched = postings.length;

    // Close out postings this company had last run but that didn't come
    // back this time -- runs unconditionally (including when 0 postings
    // were fetched, a legitimate "this company has no open roles right
    // now" outcome, not an error) since the fetch above already succeeded
    // by this point.
    try {
      const { data: previouslyActive, error: activeError } = await supabase
        .from("job_postings")
        .select("id, external_id, title, company")
        .eq("source_id", sourceId)
        .eq("company", config.companyName)
        .eq("status", "active");
      if (activeError) throw activeError;

      const closedIds = determineClosedExternalIds(
        (previouslyActive ?? []).map((row) => row.external_id),
        postings.map((p) => p.externalId),
      );
      if (closedIds.length > 0) {
        const { error: closeError } = await supabase
          .from("job_postings")
          .update({ status: "closed" })
          .eq("source_id", sourceId)
          .eq("company", config.companyName)
          .in("external_id", closedIds);
        if (closeError) throw closeError;
        summary.closed = closedIds.length;

        const closedPostings = (previouslyActive ?? []).filter((row) =>
          closedIds.includes(row.external_id),
        );
        await notifyClosedPostings(supabase, closedPostings);
      }
    } catch (err) {
      summary.errors.push(`Closing stale postings failed for ${config.companyName}: ${errorMessage(err)}`);
    }

    if (postings.length === 0) {
      summaries.push(summary);
      continue;
    }

    let embeddings: number[][];
    try {
      embeddings = await embedJobPostingTexts(postings.map(embeddingTextFor));
    } catch (err) {
      summary.errors.push(`Embedding batch failed for ${config.companyName}: ${errorMessage(err)}`);
      summaries.push(summary);
      continue;
    }

    for (let i = 0; i < postings.length; i++) {
      const posting = postings[i];
      const embedding = embeddings[i];
      try {
        const dedupKey = buildDedupKey({
          company: posting.company,
          title: posting.title,
          location: posting.location,
        });

        const { data: upserted, error: upsertError } = await supabase
          .from("job_postings")
          .upsert(
            {
              source_id: sourceId,
              external_id: posting.externalId,
              company: posting.company,
              title: posting.title,
              location: posting.location,
              remote: posting.remote,
              description: posting.description,
              url: posting.url,
              posted_at: posting.postedAt,
              embedding,
              dedup_key: dedupKey,
              // Explicit, not just the column default -- a posting closed
              // in a previous run must flip back to active if it's fetched
              // again (a company reopening a role, or a transient absence
              // that self-corrected on the next run).
              status: "active",
            },
            { onConflict: "source_id,external_id" },
          )
          .select("id")
          .single();
        if (upsertError) throw upsertError;

        const dedupGroupId = await resolveDedupGroup(supabase, {
          postingId: upserted.id,
          dedupKey,
          company: posting.company,
          embedding,
        });
        const { error: groupError } = await supabase
          .from("job_postings")
          .update({ dedup_group_id: dedupGroupId ?? upserted.id })
          .eq("id", upserted.id);
        if (groupError) throw groupError;

        summary.upserted += 1;
      } catch (err) {
        summary.errors.push(`${posting.title} (${posting.externalId}): ${errorMessage(err)}`);
      }
    }

    summaries.push(summary);
  }

  return summaries;
}
