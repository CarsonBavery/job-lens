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

export interface IngestionSummary {
  company: string;
  source: string;
  fetched: number;
  upserted: number;
  errors: string[];
}

function embeddingTextFor(posting: NormalizedJobPosting): string {
  return [posting.title, posting.location, posting.description]
    .filter(Boolean)
    .join("\n")
    .slice(0, 4000);
}

async function fetchForSource(config: CompanyConfig): Promise<NormalizedJobPosting[]> {
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
      summary.errors.push(err instanceof Error ? err.message : String(err));
      summaries.push(summary);
      continue;
    }
    summary.fetched = postings.length;

    if (postings.length === 0) {
      summaries.push(summary);
      continue;
    }

    let embeddings: number[][];
    try {
      embeddings = await embedJobPostingTexts(postings.map(embeddingTextFor));
    } catch (err) {
      summary.errors.push(
        `Embedding batch failed for ${config.companyName}: ${err instanceof Error ? err.message : String(err)}`,
      );
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
        summary.errors.push(
          `${posting.title} (${posting.externalId}): ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    summaries.push(summary);
  }

  return summaries;
}
