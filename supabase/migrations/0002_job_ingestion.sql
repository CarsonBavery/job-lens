-- Phase 3: job board ingestion support.
-- Apply via the Supabase CLI (`supabase db push`) or paste into the SQL
-- editor of the same project 0001_init.sql was applied to.

-- Stored, indexed dedup key (company+title+location, normalized -- see
-- lib/ingestion/normalize.ts) so exact-duplicate detection is a fast
-- indexed lookup instead of recomputing/comparing in application code
-- against every existing row.
alter table public.job_postings add column if not exists dedup_key text;

create index if not exists job_postings_dedup_key_idx on public.job_postings (dedup_key);

-- Embedding similarity search, used for near-duplicate detection across
-- postings that don't share an exact dedup_key (e.g. "Senior Software
-- Engineer" vs "Sr. Software Engineer, Backend" at the same company), and
-- reused as-is for Phase 4's job-to-resume match scoring.
create function public.match_job_postings(
  query_embedding vector(768),
  match_company text,
  match_threshold float default 0.85,
  match_count int default 5,
  exclude_id uuid default null
)
returns table (
  id uuid,
  title text,
  company text,
  dedup_group_id uuid,
  similarity float
)
language sql stable
as $$
  select
    job_postings.id,
    job_postings.title,
    job_postings.company,
    job_postings.dedup_group_id,
    1 - (job_postings.embedding <=> query_embedding) as similarity
  from public.job_postings
  where job_postings.company = match_company
    and job_postings.embedding is not null
    and (exclude_id is null or job_postings.id != exclude_id)
    and 1 - (job_postings.embedding <=> query_embedding) > match_threshold
  order by job_postings.embedding <=> query_embedding
  limit match_count;
$$;
