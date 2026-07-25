# PROGRESS.md — JobLens

## Current State
Phase 0 and Phase 1 are merged into `main` (PR #5) and verified against a live Supabase project. `npm run lint`, `npx tsc --noEmit`, `npm run test`, and `npm run build` all pass clean. Work has moved to branch `phase-2` for AI features. See `CLAUDE.md` for the architecture, including the "PR Workflow" section governing branch lifecycle.

**Outstanding from Phase 1, not blocking Phase 2 but not forgotten:** nobody has clicked through create → edit → autosave → export for a resume/cover letter in the browser (only signup/login and route-level checks are confirmed). Google OAuth isn't configured (deferred by choice). `main`-branch protection (blocking direct pushes, requiring PRs) has been requested by the user but is **not yet confirmed set up** — it requires a GitHub ruleset change neither `gh` CLI nor an API token is available here to make; needs manual verification.

## Immediate Backlog

**Phase 0 — Project setup** ✅ done 2026-07-24, ✅ verified live 2026-07-25, ✅ merged to `main` 2026-07-25 (PR #5)

**Phase 1 — Core MVP (auth + storage)** ✅ built + merged to `main` 2026-07-25 (PR #5)
- [x] Supabase Auth (email + Google OAuth) integration — email/password ready; Google provider deliberately not configured yet (deferred, not blocking)
- [x] Resume CRUD with free-tier limit (3), edited as rich text (Tiptap), not raw file upload
- [x] Cover letter CRUD with free-tier limit (1), same editor
- [x] Basic dashboard UI
- [x] `.docx` export for both document types
- [ ] **Deferred by design:** `.docx` *import* (upload an existing resume to start editing) — user chose create-in-editor-only for Phase 1; revisit if users want to start from an existing file
- [x] Signup and login confirmed working in the browser
- [x] Diagnosed and fixed a `23503` foreign-key error on document creation (missing `profiles` row for the user's account — see session log)
- [ ] Click through create resume → edit → autosave → export in the browser (still not done by anyone — carry forward, not a Phase 2 blocker)

**Phase 2 — AI features** (branch: `phase-2`)
- [ ] Gemini-powered resume tailoring to a specific job posting
- [ ] Gemini-powered cover letter generation
- [ ] Job-to-resume match scoring (pgvector embeddings) — **note:** meaningful matching needs real job postings, which don't exist until Phase 3's ingestion is built; scope this carefully rather than building against fake data

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
- **2026-07-24** — Force-pushed the local JobLens rebuild over the old GitHub `main` (previous React-based attempt with login/dashboard/landing pages), per user's explicit choice to erase rather than preserve that history. Required the user to temporarily disable the "block force pushes" rule in the repo's GitHub ruleset first — no `gh` CLI available in this environment to do it via API.
- **2026-07-25** — Built Phase 1. User added a requirement mid-phase: resumes/cover letters should be editable as a Word-style document in-browser, not just uploaded files — researched editor options (Tiptap recommended over Lexical for this use case) and confirmed with the user to scope out `.docx` import for now (create-in-editor only, export-to-`.docx` via the `docx` package). Built: email/password + Google OAuth via Supabase Auth (`lib/auth/actions.ts`, `app/login`, `app/signup`, `app/auth/callback`), protected dashboard shell, resume/cover-letter list+create+delete pages with tier-limit enforcement, Tiptap editor with 1s-debounced autosave (`components/editor/`), `.docx` export routes, and the Tiptap→docx converter (`lib/tiptap/toDocx.ts`, with tests). Landing page and default create-next-app SVGs replaced/removed. Hit and fixed two non-obvious issues: (1) a hand-written Supabase `Database` type silently resolves all query results to `never` unless it includes `Views`/`Functions`/`Enums`/`CompositeTypes` and every table has `Relationships: []` — not optional, even when unused; (2) `NextResponse` needs a `Uint8Array`, not a raw Node `Buffer`, for a binary body. `lint`, `tsc --noEmit`, `test`, and `build` all pass. Still not runtime-verified — no live Supabase project yet (same gap as Phase 0).
- **2026-07-25** — User created the live Supabase project and ran the migration; wired up `.env.local` (gitignored, values never echoed back after the initial paste). Caught and fixed two real bugs during connection testing: (1) the migration never enabled RLS on `job_sources`, so its 4 seeded rows were invisible to the anon key despite existing in the database (diagnosed via a `pg_catalog` query comparing live DB state to expectations, then patched both the live DB and `supabase/migrations/0001_init.sql`); (2) `getDocument()` threw an unhandled Postgres `22P02 invalid input syntax for type uuid` error (→ HTTP 500) for any non-UUID document ID instead of a clean 404 — found by deliberately hitting the export route with a bogus ID, fixed by catching that error code and treating it as "not found." Started the dev server and confirmed `/`, `/login`, `/signup` return 200, `/dashboard` and its subroutes correctly 307-redirect unauthenticated requests to `/login`, and both malformed and valid-but-missing document IDs now 404 instead of 500. No one has clicked through the actual UI in a browser yet — only route-level HTTP checks so far. Dev server left running for the user to try next.
- **2026-07-25** — User confirmed signup and login work in the browser. Committed all Phase 0 + Phase 1 work (34 files) to the pre-existing `phase-1` branch and pushed it to GitHub — nothing was committed straight to `main`. Drafted a PR description (summary, bugs found, explicitly-out-of-scope, testing performed/outstanding) since no `gh` CLI is available in this environment to open the PR directly; gave the user the compare URL and copy-pasteable title/body instead. Added a standing "PR Workflow" section to `CLAUDE.md` so this happens automatically at the end of every phase from now on, without being asked.
- **2026-07-25** — User hit a `23503` foreign-key-violation error creating a cover letter. Diagnosed via the live DB (using the service role key, no `gh`/psql access needed): `public.profiles` was completely empty despite the user having a real, confirmed `auth.users` account — the `on_auth_user_created` trigger hadn't fired for that specific signup. Verified the trigger definition itself is correct by creating a throwaway test user via the Supabase Auth admin API: a profile row was created for it automatically, proving the trigger works for new signups (then deleted the test user; `ON DELETE CASCADE` cleaned up its profile too). Manually backfilled the missing `profiles` row for the real account via a direct `POST` to the PostgREST API with the service role key — no code or migration changes needed, this was a one-off data gap, most likely a timing fluke from right after the migration/trigger were first created. User should retry creating a resume/cover letter now.
- **2026-07-25** — User merged and deleted `phase-1` on GitHub (PR #5). Did the branch handoff: `git checkout main && git pull` (fast-forwarded onto the merge commit), `git fetch --prune` (cleared the stale `origin/phase-1` ref), `git branch -d phase-1` (local delete, safe because it was fully merged), then created and pushed `phase-2`. Codified this whole sequence into `CLAUDE.md`'s "PR Workflow" section as a "starting a new phase" checklist to run automatically going forward, no longer just an "ending a phase" one. User also asked that `main` be made un-editable except via merged PRs — documented in `CLAUDE.md` that this needs a GitHub ruleset change (Settings → Rules → Rulesets) which has to be done manually in the browser; flagged as not-yet-confirmed-active rather than assumed done.
