-- Phase 7: in-app notifications, currently only used for "a job posting
-- linked to one of your applications closed" (see lib/ingestion/run.ts).
-- Deliberately in-app only, not email, per the user's explicit choice --
-- no dependency on the still-outstanding Phase 9 custom-SMTP item.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  application_id uuid references public.applications (id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications are owner-only" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index notifications_user_unread_idx on public.notifications (user_id, read);
