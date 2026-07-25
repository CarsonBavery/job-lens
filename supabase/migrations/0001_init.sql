-- JobLens initial schema
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL editor
-- of a project that has already run `create extension if not exists vector;`
-- eligible (Database > Extensions > vector, or the line below).

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- profiles: 1:1 with auth.users, holds app-level user state
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro')),
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- resumes / cover_letters
-- is_base = one of the free/paid tier's base documents.
-- A non-base row (base_resume_id set) is a Gemini-tailored copy made for a
-- specific application and does NOT count against the base-document quota.
-- ---------------------------------------------------------------------------
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  job_title text,
  content jsonb not null default '{}'::jsonb,
  file_path text,
  is_base boolean not null default true,
  base_resume_id uuid references public.resumes (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  file_path text,
  is_base boolean not null default true,
  base_cover_letter_id uuid references public.cover_letters (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resumes enable row level security;
alter table public.cover_letters enable row level security;

create policy "resumes are owner-only" on public.resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cover letters are owner-only" on public.cover_letters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index resumes_user_id_idx on public.resumes (user_id);
create index cover_letters_user_id_idx on public.cover_letters (user_id);

-- ---------------------------------------------------------------------------
-- job_sources / job_postings
-- Ingested only from free, public ATS APIs (Greenhouse, Lever, Ashby,
-- Workable) -- see CLAUDE.md. Public read, service-role-only writes.
-- ---------------------------------------------------------------------------
create table public.job_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.job_sources (name) values
  ('greenhouse'), ('lever'), ('ashby'), ('workable');

create table public.job_postings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.job_sources (id),
  external_id text not null,
  company text not null,
  title text not null,
  location text,
  remote boolean not null default false,
  description text,
  url text not null,
  salary_min integer,
  salary_max integer,
  posted_at timestamptz,
  -- text-embedding-004 (Gemini) output dimension, used for cross-source dedup
  -- and resume/job match scoring.
  embedding vector(768),
  dedup_group_id uuid,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, external_id)
);

alter table public.job_postings enable row level security;

create policy "job postings are publicly readable" on public.job_postings
  for select using (true);

create index job_postings_dedup_group_idx on public.job_postings (dedup_group_id);
create index job_postings_posted_at_idx on public.job_postings (posted_at desc);
create index job_postings_embedding_idx on public.job_postings
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ---------------------------------------------------------------------------
-- applications: tracks a user's pipeline, pinned to the exact resume/cover
-- letter version used.
-- ---------------------------------------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_posting_id uuid references public.job_postings (id) on delete set null,
  resume_id uuid references public.resumes (id) on delete set null,
  cover_letter_id uuid references public.cover_letters (id) on delete set null,
  status text not null default 'saved'
    check (status in ('saved', 'applied', 'interviewing', 'offer', 'rejected')),
  applied_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.applications enable row level security;

create policy "applications are owner-only" on public.applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index applications_user_id_idx on public.applications (user_id);
create index applications_job_posting_id_idx on public.applications (job_posting_id);

-- ---------------------------------------------------------------------------
-- subscriptions: source of truth synced from Stripe webhooks.
-- profiles.subscription_tier is a cached flag for cheap in-app checks.
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  price_id text,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions are viewable by owner" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.resumes
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.cover_letters
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.job_postings
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.applications
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();
