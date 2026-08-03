-- Job board completeness (Phase 9, see PROGRESS.md): title/company search
-- currently runs as `ILIKE '%term%'` in lib/jobs/db.ts, which can't use a
-- standard btree index and forces a full table scan on every search. Fine
-- at today's low row count, won't be once the 22-company seed list actually
-- ingests at volume. Per supabase-postgres-best-practices, tsvector + GIN
-- full-text search is ~100x faster than ILIKE and index-backed.
--
-- `generated always as ... stored` keeps this in sync automatically on
-- every insert/upsert -- lib/ingestion/run.ts doesn't need to compute or
-- write it.
alter table public.job_postings
  add column if not exists search_vector tsvector
    generated always as (
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(company, ''))
    ) stored;

create index if not exists job_postings_search_idx
  on public.job_postings using gin (search_vector);
