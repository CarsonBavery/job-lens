-- Job posting staleness: without this, the ingestion pipeline only ever
-- adds/updates rows -- a posting that gets filled or pulled by the company
-- stays in the DB (and in search results) forever, and the table grows
-- without bound. Soft-delete via a status column, not a hard DELETE:
-- applications.job_posting_id references these rows, and a user's
-- application history needs the title/company/url to still resolve even
-- after the underlying posting closes (on delete set null would otherwise
-- silently blank out that history the moment a job closed).
alter table public.job_postings
  add column if not exists status text not null default 'active'
    check (status in ('active', 'closed'));

create index if not exists job_postings_status_idx on public.job_postings (status);

-- Both matching RPCs should only ever surface postings a user could
-- actually apply to.
create or replace function public.match_job_postings(
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
    and job_postings.status = 'active'
    and job_postings.embedding is not null
    and (exclude_id is null or job_postings.id != exclude_id)
    and 1 - (job_postings.embedding <=> query_embedding) > match_threshold
  order by job_postings.embedding <=> query_embedding
  limit match_count;
$$;

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
    where job_postings.status = 'active'
      and job_postings.embedding is not null
      and 1 - (job_postings.embedding <=> query_embedding) > match_threshold
    order by coalesce(job_postings.dedup_group_id, job_postings.id), similarity desc
  ) ranked
  order by ranked.similarity desc
  limit match_count;
$$;
