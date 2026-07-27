-- Phase 6: per-user rate limiting on Gemini generate_content calls
-- (tailorResume, generateCoverLetter, project GitHub summarization). Was
-- previously flagged (see CLAUDE.md) as a real gap: no per-user cap existed
-- even though the paid Gemini tier means real usage has real $ cost.
--
-- A plain event log, not a running counter column, so the limit can be a
-- rolling 24h window (count rows newer than now() - 24h) rather than a
-- fixed calendar day that resets at midnight regardless of when the user's
-- usage actually happened.
create table public.ai_generation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.ai_generation_events enable row level security;

create policy "ai generation events are owner-only" on public.ai_generation_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index ai_generation_events_user_created_idx
  on public.ai_generation_events (user_id, created_at);
