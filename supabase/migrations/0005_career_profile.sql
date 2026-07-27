-- Phase 5: career profile (projects, education, work experience) that
-- Gemini can draw on when tailoring resumes/cover letters and scoring job
-- matches. Same ownership pattern as resumes/cover_letters: owner-only RLS,
-- cascade-deleted with the profile.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  tech_stack text,
  github_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  institution text not null,
  degree text,
  field_of_study text,
  start_date date,
  end_date date,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- end_date null = current role, same convention as a resume's own
-- "present" entries -- not "unknown," so the UI must treat it as such
-- rather than showing a blank.
create table public.work_experience (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  company text not null,
  title text not null,
  location text,
  start_date date,
  end_date date,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.education enable row level security;
alter table public.work_experience enable row level security;

create policy "projects are owner-only" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "education is owner-only" on public.education
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "work experience is owner-only" on public.work_experience
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index projects_user_id_idx on public.projects (user_id);
create index education_user_id_idx on public.education (user_id);
create index work_experience_user_id_idx on public.work_experience (user_id);

create trigger set_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.education
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.work_experience
  for each row execute procedure public.set_updated_at();
