-- STEM discipline categorization: the job board is now the app's primary
-- surface (see CLAUDE.md), so postings need a real, filterable per-row
-- category rather than relying on the seed company list alone to keep
-- results STEM-skewed. Computed by lib/ingestion/categorize.ts at ingestion
-- time (department hint where a source provides one, keyword fallback
-- otherwise) and written on every upsert -- existing rows default to
-- 'non_technical' until the next ingestion run recomputes them (runIngestion
-- re-upserts every currently-fetched posting on every pass, so this is a
-- self-correcting backfill, not something requiring a manual script).
alter table public.job_postings
  add column if not exists category text not null default 'non_technical'
    check (category in (
      'software', 'data_ml', 'hardware', 'biotech',
      'infrastructure_security', 'other_stem', 'non_technical'
    ));

create index if not exists job_postings_category_idx on public.job_postings (category);

-- Both matching RPCs re-declared (not just altered) to surface `category` --
-- match_job_postings (dedup use) doesn't need it, match_jobs_for_resume does
-- so MatchingJobsPanel can show a category badge per result.
create or replace function public.match_jobs_for_resume(
  query_embedding vector(768),
  match_threshold float default 0.3,
  match_count int default 20
)
returns table (
  id uuid,
  title text,
  company text,
  location text,
  remote boolean,
  url text,
  dedup_group_id uuid,
  category text,
  similarity float
)
language sql stable
as $$
  select ranked.id, ranked.title, ranked.company, ranked.location,
         ranked.remote, ranked.url, ranked.dedup_group_id, ranked.category,
         ranked.similarity
  from (
    select distinct on (coalesce(job_postings.dedup_group_id, job_postings.id))
      job_postings.id,
      job_postings.title,
      job_postings.company,
      job_postings.location,
      job_postings.remote,
      job_postings.url,
      job_postings.dedup_group_id,
      job_postings.category,
      1 - (job_postings.embedding <=> query_embedding) as similarity
    from public.job_postings
    where job_postings.status = 'active'
      and job_postings.embedding is not null
      and 1 - (job_postings.embedding <=> query_embedding) > match_threshold
    order by coalesce(job_postings.dedup_group_id, job_postings.id), similarity desc
  ) ranked
  order by ranked.similarity desc
  limit match_count;
$$;
