-- Phase 4: job-to-resume match scoring.
-- Apply via the Supabase CLI (`supabase db push`) or paste into the SQL
-- editor of the same project 0001/0002 were applied to.

-- A resume's own embedding, computed lazily (see lib/matching/) the first
-- time a user asks for matching jobs, not on every autosave -- most edits
-- don't change the semantic content enough to be worth a Gemini call.
alter table public.resumes add column if not exists embedding vector(768);

-- Hash of the plain-text content the stored embedding was computed from, so
-- a repeat "find matching jobs" click can skip re-embedding unchanged
-- content instead of re-calling Gemini every time.
alter table public.resumes add column if not exists embedding_source_hash text;

-- Ranks job postings against a resume's embedding. Deliberately a separate
-- function from match_job_postings (Phase 3's near-duplicate detector):
-- that one is scoped to a single company with a high 0.85 similarity floor
-- meant to catch reworded copies of the *same* posting, which is far too
-- strict for "does this resume broadly fit this job" -- and resume matching
-- needs to search across every company, not just one.
--
-- distinct on (dedup group) keeps only the best-scoring posting per
-- dedup_group_id so near-duplicate postings (see Phase 3) don't crowd out
-- distinct results with repeats of the same underlying job.
create function public.match_jobs_for_resume(
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
  similarity float
)
language sql stable
as $$
  select ranked.id, ranked.title, ranked.company, ranked.location,
         ranked.remote, ranked.url, ranked.dedup_group_id, ranked.similarity
  from (
    select distinct on (coalesce(job_postings.dedup_group_id, job_postings.id))
      job_postings.id,
      job_postings.title,
      job_postings.company,
      job_postings.location,
      job_postings.remote,
      job_postings.url,
      job_postings.dedup_group_id,
      1 - (job_postings.embedding <=> query_embedding) as similarity
    from public.job_postings
    where job_postings.embedding is not null
      and 1 - (job_postings.embedding <=> query_embedding) > match_threshold
    order by coalesce(job_postings.dedup_group_id, job_postings.id), similarity desc
  ) ranked
  order by ranked.similarity desc
  limit match_count;
$$;
