# PROGRESS.md — JobLens

## Current State
Phase 0 (project setup) is complete. Deps installed, DB schema drafted (not yet applied to a live database — no Supabase project exists yet), client scaffolding for Supabase/Gemini/Stripe in place, Vitest + Playwright wired up and verified working, README/metadata updated. `npm run lint`, `npx tsc --noEmit`, and `npm run test` all pass clean. No UI/features built yet — `app/page.tsx` is still the default template. See `CLAUDE.md` for the architecture this was built against.

**Manual step still needed from the user:** create the actual Supabase/Stripe/Gemini accounts, fill in `.env.local` from `.env.example`, and run `supabase/migrations/0001_init.sql` against the new project — none of that can be done without dashboard/account access.

## Immediate Backlog

**Phase 0 — Project setup** ✅ done 2026-07-24 (schema written, not yet applied — see note above)

**Phase 1 — Core MVP (auth + storage)**
- [ ] Supabase Auth (email + Google OAuth) integration
- [ ] Resume upload/storage with free-tier limit (3 resumes)
- [ ] Cover letter upload/storage with free-tier limit (1)
- [ ] Basic dashboard UI

**Phase 2 — AI features**
- [ ] Gemini-powered resume tailoring to a specific job posting
- [ ] Gemini-powered cover letter generation
- [ ] Job-to-resume match scoring (pgvector embeddings)

**Phase 3 — Job board aggregation**
- [ ] Greenhouse/Lever/Ashby/Workable ingestion (Vercel cron)
- [ ] Normalization schema across sources
- [ ] Dedup pipeline (company+title+location + embedding similarity)
- [ ] Job search/browse UI

**Phase 4 — Billing**
- [ ] Stripe checkout + customer portal
- [ ] Webhook handling (subscription created/updated/canceled)
- [ ] Tier limit enforcement (storage quotas, usage)

**Phase 5 — Application tracking**
- [ ] Save/apply/status pipeline (saved → applied → interviewing → offer/rejected)
- [ ] Link applications to the specific resume/cover-letter version used

## Recent Session Activity
- **2026-07-24** — Initial onboarding audit; created `CLAUDE.md`, `.claudeignore`, `PROGRESS.md` for the bare scaffold.
- **2026-07-24** — User corrected scope: JobLens is an AI job-search assistant (Gemini-powered resume/cover-letter tailoring, application tracking, deduplicated multi-source job board), not a generic template. Researched job-data access (Indeed API retired 2024, no LinkedIn public API — scraping ruled out on ToS/legal grounds), AI SaaS stack conventions, and Gemini SDK. User chose: free ATS APIs (Greenhouse/Lever/Ashby/Workable) over scraping/paid aggregator for now, Supabase over best-of-breed split, Stripe over Lemon Squeezy. Rewrote `CLAUDE.md` and this backlog to match. No code written yet.
- **2026-07-24** — Completed Phase 0. Installed `@supabase/supabase-js`, `@supabase/ssr`, `@google/genai`, `stripe`, `zod` + Vitest/Playwright/Testing Library dev deps; patched a critical Next.js RCE by bumping 15.5.0→15.5.21 (left a handful of dev-only ESLint-chain ReDoS advisories alone since npm's fix would downgrade `@eslint/eslintrc` and break linting). Wrote the full DB schema (`supabase/migrations/0001_init.sql`) with RLS on every user-owned table and a pgvector column on `job_postings` for dedup/matching. Added `lib/supabase/{client,server,middleware}.ts`, root `middleware.ts` for session refresh, `lib/gemini/client.ts`, `lib/stripe/client.ts`, `lib/ingestion/normalize.ts` (dedup key builder, with tests), and `types/database.ts`. Set `"type": "module"` in `package.json` and defaulted the Vitest environment to `node` (not `jsdom`) to work around a jsdom transitive-dependency ESM/CJS bug — component tests should opt into jsdom per-file. Verified `lint`, `tsc --noEmit`, and `test` all pass. Updated `README.md` and `app/layout.tsx` metadata. Supabase/Stripe/Gemini accounts and the actual migration run are still outstanding — need the user's own credentials.
