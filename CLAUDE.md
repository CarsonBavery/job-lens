# CLAUDE.md — JobLens

## Product
JobLens is an AI-assisted job search platform: resume & cover letter maintenance (Gemini-tailored per posting), application tracking, and a deduplicated multi-source job board aggregator. Free tier: 3 base resumes + 1 cover letter. Paid tier: higher storage/usage limits, later licensed job-source coverage.

**Status:** Phase 1, Phase 2, Phase 3, and Phase 4 (job-to-resume match scoring — a resume's own embedding, computed lazily on click, ranked against all current postings via `match_jobs_for_resume`) are merged to `main`, plus a job-posting-staleness fix (PR #9): `job_postings.status` (`active`/`closed`, soft-delete since `applications` references these rows), `lib/ingestion/run.ts` now closes any previously-active posting a company's fetch doesn't return, and both matching RPCs + the job search page filter to `status = 'active'`. The user also asked for a job application tracker with removal-from-board + notification when a saved job closes — most of the tracker itself was already scoped as Phase 7 ("Application tracking"); the removal/notification piece (in-app notifications, per the user's choice) has been added to Phase 7's backlog rather than built now, since it needs the tracker UI to exist first. A front-end visual polish pass was also flagged (not yet scoped) — added to Phase 8's backlog. Phase 5 ("Career profile" — projects/education/work history for Gemini to draw on when tailoring) is now in progress on branch `phase-5`; later phases: Billing→6, Application tracking→7, Pre-launch hardening→8, Launch→9 — see `PROGRESS.md` for the full backlog. The Gemini API key is on a paid tier as of 2026-07-26 (removed the free tier's 20-requests/day cap that had blocked `ai-features.spec.ts`) — a full-scale ingestion run (all 7 seed companies) was then timed for real at 65–107s, which surfaced and fixed a genuine bug (10/104 live Vanta postings failing a `NOT NULL` constraint because Ashby's `isRemote` field isn't always present). See "Gemini rate limits" below — still relevant even on paid tier, since the per-*minute* `embed_content` limit isn't a free-tier-only thing.

## Tech Stack
- **Framework:** Next.js 15 (App Router, Turbopack), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS 4
- **Backend/data:** Supabase — Postgres, Auth, Storage (resume/cover-letter files), pgvector (embeddings for dedup + job/resume matching)
- **AI:** Google Gemini via `@google/genai`, structured output validated with Zod
- **Document editor:** Tiptap (ProseMirror) — resumes/cover letters are edited as rich text in-app (Word-like WYSIWYG), stored as Tiptap/ProseMirror JSON in Postgres (`content` column), exported to real `.docx` on demand via the `docx` npm package. No `.docx` *import* yet (create-in-editor only for now, by design).
- **Payments:** Stripe (subscriptions, tiered limits)
- **Job ingestion:** direct free ATS APIs only — Greenhouse, Lever, Ashby, Workable (`lib/ingestion/`). **No LinkedIn/Indeed scraping** — Indeed retired its public API in 2024 and LinkedIn has never offered one; scraping either violates ToS. A licensed aggregator (e.g. TheirStack) is the planned path to add that coverage later, gated behind the paid tier.
- **Deployment:** Vercel — `vercel.json` schedules `/api/cron/ingest` every 6 hours (not live until Phase 7; the route works standalone today via a manually-sent `Authorization: Bearer $CRON_SECRET`)
- **Testing:** Vitest (unit, `*.test.ts` colocated with source) + Playwright (e2e, `e2e/`)

Full rationale for these choices lives in persistent memory (`joblens-stack-decision`), not here — this file is the current-state reference.

## Architecture Map
- `app/page.tsx` — public landing page (sign in / get started)
- `app/login/`, `app/signup/`, `app/signup/check-email/` — auth pages (Client Components, `useActionState` + Server Actions)
- `app/auth/callback/route.ts` — OAuth + email-confirmation-link landing point (`exchangeCodeForSession`)
- `app/dashboard/layout.tsx` — auth gate (redirects to `/login`) + nav shell for everything below
- `app/dashboard/page.tsx` — overview (doc counts vs. tier limits)
- `app/dashboard/resumes/`, `app/dashboard/cover-letters/` — list pages (create/delete) + `[id]/` editor pages
- `app/api/resumes/[id]/export/`, `app/api/cover-letters/[id]/export/` — `.docx` download route handlers
- `middleware.ts` — refreshes the Supabase auth session cookie on every request
- `lib/supabase/client.ts` — browser client (Client Components)
- `lib/supabase/server.ts` — cookie-based server client (Server Components/Route Handlers); imports `next/headers`, so it's **only** importable from Next.js runtime code
- `lib/supabase/serviceRole.ts` — `createServiceRoleClient()`, RLS-bypassing, for scheduled jobs/webhooks. Deliberately **not** in `server.ts` — that file's `next/headers` import made the whole module unimportable from plain Node contexts (e.g. an e2e test calling `runIngestion()` directly), even though this export itself has no such dependency. Keep server-only helpers with zero Next.js-runtime deps in their own file for this reason.
- `lib/supabase/middleware.ts` — session-refresh helper used by `middleware.ts`
- `lib/auth/actions.ts` — sign in/up/out Server Actions (Zod-validated)
- `lib/documents/db.ts` — shared CRUD + tier-limit helpers used by both resumes and cover letters (the two tables only differ in a couple of type-specific columns). `listTailoredDocuments` finds the non-base children of a given base document (via `base_resume_id`/`base_cover_letter_id`) — any new way of creating a non-base document must set that parent link, or the result is permanently unreachable (see Code Conventions).
- `lib/resumes/actions.ts`, `lib/cover-letters/actions.ts` — thin per-entity Server Action wrappers around `lib/documents/db.ts`
- `lib/tiptap/toDocx.ts` — converts Tiptap/ProseMirror JSON to a `.docx` buffer
- `lib/tiptap/toPlainText.ts` — Tiptap JSON → plain text, used to feed a document's current content to Gemini as prompt context
- `lib/tiptap/fromBlocks.ts` — converts Gemini's structured block output back into Tiptap JSON (groups consecutive `bullet` blocks into one `bulletList`)
- `lib/gemini/client.ts` — `getGeminiClient()` (lazy singleton — see Code Conventions) + model name constants. Uses Google's rolling aliases (`gemini-flash-latest`, `gemini-embedding-001`), not pinned snapshots — `gemini-2.5-flash` and `text-embedding-004` both 404'd for this project's API key even while still listed by `ListModels`, so pinned names aren't safe to assume stay valid.
- `lib/gemini/schemas.ts` — the `Block`/`blocksJsonSchema` shape all Gemini generation calls return: flat `{ type, text }[]`, deliberately not raw Tiptap JSON (too easy for a model to get the nested node shape subtly wrong)
- `lib/gemini/generateBlocks.ts` — shared call-Gemini-with-schema-and-validate-the-response helper
- `lib/gemini/tailorResume.ts`, `lib/gemini/generateCoverLetter.ts` — the two prompts, both explicitly instructed not to fabricate experience beyond what's in the source resume
- `lib/gemini/retryOnRateLimit.ts` — wraps a Gemini call with retry-on-429 logic: parses Google's own `retryDelay` from the error body when present, otherwise falls back to a ~66s wait (long enough to clear a per-*minute* quota window — see "Gemini rate limits" below). Every Gemini call site (`generateBlocks.ts`, `lib/ingestion/embed.ts`, `lib/gemini/embedText.ts`) goes through this; don't call the SDK directly from new code.
- `lib/gemini/embedText.ts` — single-text embedding call (a resume's full plain-text content), the one-off counterpart to `lib/ingestion/embed.ts`'s 100-per-batch job-posting embedder; kept as a separate file rather than generalizing that one, to avoid any risk to its working batching logic
- `lib/stripe/client.ts` — Stripe client
- `lib/ingestion/types.ts` — `NormalizedJobPosting` shape every source connector maps its API response into
- `lib/ingestion/sources/{greenhouse,lever,ashby,workable}.ts` — one connector per ATS, no auth required for any of them. Workable's list endpoint doesn't include descriptions (always `null` there); Greenhouse's `content` field is HTML-*encoded* (`&lt;div&gt;`), not raw HTML — decode entities before stripping tags; Ashby's `isRemote` field is sometimes absent despite the docs implying it's always a boolean — coerce with `?? false`, don't pass it straight through (confirmed live: 10/104 Vanta postings had this, all failing `job_postings.remote`'s `NOT NULL` constraint until fixed)
- `lib/ingestion/companies.ts` — seed company list; every token was live-verified via a direct API call before being added (there's no discovery API for any of these ATSs — a typo silently returns zero postings, not an error)
- `lib/ingestion/embed.ts` — batches job postings into `gemini-embedding-001` calls (chunked at Gemini's 100-text-per-request hard cap) rather than one call per posting
- `lib/ingestion/normalize.ts` — cross-source job dedup key builder
- `lib/ingestion/dedup.ts` — resolves a posting's `dedup_group_id`: exact `dedup_key` match first (cheap, indexed), then embedding similarity within the same company via the `match_job_postings` RPC (`supabase/migrations/0002_job_ingestion.sql`)
- `lib/ingestion/run.ts` — orchestrates fetch → normalize → batch-embed → upsert → dedup for each configured company; safe to re-run (upserts on `source_id`+`external_id`). Retries a source fetch once after a transient failure (`fetch failed`/DNS blips were observed live against multiple ATSs, not hypothetical). Its `errorMessage()` helper exists because Supabase's `PostgrestError` isn't `instanceof Error` — `String(err)` on it silently produces `"[object Object]"`, which is exactly what hid the Ashby bug above during a live timing run; don't reintroduce a plain `instanceof Error` check elsewhere in this file. Also marks `job_postings.status = 'closed'` for any previously-active posting a company's current fetch didn't return (`determineClosedExternalIds`, unit-tested), and explicitly re-sets `status: 'active'` on every upsert so a posting that closes then reopens flips back correctly — this only ever runs after a successful fetch, never on a fetch failure, so a transient network blip can't be mistaken for "this company has zero open roles" and wrongly close everything
- `app/api/cron/ingest/route.ts` — triggers `runIngestion()`, gated on `Authorization: Bearer $CRON_SECRET`
- `app/dashboard/jobs/page.tsx` — search/browse UI; user search input is sanitized before going into a PostgREST `.or()` filter string (raw interpolation there is a filter-injection risk, not just an XSS one); filters to `status = 'active'` so closed postings (see `lib/ingestion/run.ts`) don't show up as searchable
- `lib/matching/hash.ts` — SHA-256 of a resume's plain-text content, used to detect whether a cached embedding is stale without re-embedding unchanged content
- `lib/matching/db.ts` — reads/writes `resumes.embedding`/`embedding_source_hash`, calls the `match_jobs_for_resume` RPC
- `lib/matching/actions.ts` — `findMatchingJobs` Server Action: (re)embeds a resume only if its content hash changed since the last embed, then ranks current job postings against it. Triggered by an explicit button click, not autosave — see the "No per-user rate limiting" note below, this is exactly the kind of Gemini call that shouldn't fire automatically until that exists
- `components/auth/GoogleSignInButton.tsx` — client-side OAuth trigger
- `components/editor/DocumentEditor.tsx`, `EditorToolbar.tsx` — the Tiptap editor UI, autosaves 1s after the user stops typing
- `components/editor/TailoredVersionsList.tsx` — renders on a base document's editor page, linking to every non-base document derived from it (see `listTailoredDocuments`)
- `components/editor/MatchingJobsPanel.tsx` — "Matching jobs" panel on a resume's editor page, ranks current job postings by similarity to that resume via `findMatchingJobs`
- `types/database.ts` — hand-written Supabase `Database` type; regenerate with `supabase gen types` once a live project exists. **Must include `Views`/`Functions`/`Enums`/`CompositeTypes` and per-table `Relationships: []`** even though this schema uses none of them — omitting any of those silently collapses query result types to `never` instead of erroring (cost real debugging time once already).
- `supabase/migrations/0001_init.sql` — full schema, apply via Supabase CLI or SQL editor
- `supabase/migrations/0002_job_ingestion.sql` — adds `job_postings.dedup_key` (+ index) and the `match_job_postings` pgvector RPC. **Every migration after `0001` must be applied manually** by the user via the SQL editor — there's no automated promotion path yet (that's a Phase 6 item)
- `supabase/migrations/0003_match_scoring.sql` — adds `resumes.embedding` + `embedding_source_hash`, and the `match_jobs_for_resume` RPC (all companies, 0.3 similarity floor, one result per `dedup_group_id`) — a separate function from `match_job_postings` on purpose, see Status above
- `supabase/migrations/0004_job_posting_status.sql` — adds `job_postings.status` (`active`/`closed`, default `active`) and updates both `match_job_postings` and `match_jobs_for_resume` to filter on it. Soft-delete by design, not a hard `DELETE`: `applications.job_posting_id` references these rows, and a hard delete (or the existing `on delete set null`) would blank out a user's application history the moment the underlying posting closed
- `public/` — static assets (currently empty — default create-next-app svgs were removed as dead weight)
- Path alias: `@/*` → project root

Core data entities (Postgres): `profiles`, `resumes`, `cover_letters`, `job_postings` (+ `job_sources`), `applications` (links a posting to the resume/cover-letter version used + status), `subscriptions`. RLS is on for every user-owned table; `job_postings`/`job_sources` are public-read, service-role-write only.

## Essential Commands
```bash
npm run dev          # start dev server (Turbopack) at localhost:3000
npm run build        # production build (Turbopack)
npm run start        # run production build
npm run lint         # eslint
npm run test         # vitest (unit)
npm run test:watch   # vitest watch mode
npm run test:e2e     # playwright (spins up its own dev server)
```
`package.json` has `"type": "module"` — required for the Vitest ESM toolchain. Vitest defaults to the `node` environment; add `// @vitest-environment jsdom` to the top of a test file for component tests (a jsdom transitive-dep bug breaks it if set globally — see `vitest.config.mts` comment).

**Running Playwright (`test:e2e`):** this project directory lives inside OneDrive sync, which locks files in `test-results/` between runs and can make Playwright's own cleanup fail with `EPERM: operation not permitted, rmdir`. If a run fails with that error before any test even starts, `rm -rf test-results playwright-report` and rerun — it's a OneDrive artifact, not a real failure. `playwright.config.ts` loads `.env.local` via `process.loadEnvFile()` so e2e tests can talk to Supabase directly (e.g. creating a throwaway test user) — Playwright's Chromium binary itself needs `npx playwright install chromium` once per machine, and that install (like anything hitting the network) must run via the Bash tool, not PowerShell, which has no network access in this environment. `fullyParallel: false` / `workers: 1` is deliberate, not a leftover default — see "Gemini rate limits" below.

**Gemini rate limits — read before assuming an e2e failure is a code bug:** the API key is on a **paid tier as of 2026-07-26**, which removed the free tier's 20-requests/day `generate_content` cap (confirmed: `ai-features.spec.ts` now passes reliably, and the ingestion idempotency test's runtime dropped from ~46s–1.4min of rate-limit retry waits to a flat 15s). Still true regardless of tier: `embed_content` has a per-*minute* quota (~100 req/min on free tier; paid tier raises but doesn't eliminate it) — fixed by batching (`lib/ingestion/embed.ts` chunks at Gemini's 100-texts-per-call hard cap) and `retryOnRateLimit` waiting out the window on a 429. If a `RESOURCE_EXHAUSTED` error's `quotaId` contains `PerDay`, that's a *daily* cap no amount of in-test retrying fixes — check `ai.dev/rate-limit` for actual remaining quota before debugging further. Per-user cost control (separate from hitting Google's own limits) is still an open Phase 5 item — real usage now has real $ cost (~$0.01/action), just no more hard availability wall.

## Code Conventions
- Functional components, default exports for pages/layouts.
- Tailwind utility classes directly in JSX; no CSS modules.
- TypeScript strict mode — avoid `any`, prefer explicit types; Zod schemas double as runtime validation + type source for AI/API boundaries. The two `eslint-disable-next-line @typescript-eslint/no-explicit-any` casts in `lib/documents/db.ts` are a deliberate, contained exception (Supabase's generic query builder can't type a table param that's a union of two differently-shaped tables) — don't spread that pattern elsewhere.
- Mutations go through Server Actions (`lib/*/actions.ts`, `"use server"`), not client-side `fetch` to API routes. API routes (`app/api/`) are reserved for things that need to *return a file/response* a Server Action can't (e.g. `.docx` downloads).
- Use the `@/*` path alias instead of relative `../../` imports.
- Server-side Supabase/Stripe/Gemini calls belong in `lib/`, not inline in route handlers or components.
- Server-only clients (Gemini, and anything similar added later) must be **lazily constructed** behind a function, not built at module top-level — `lib/gemini/client.ts`'s `getGeminiClient()` is the pattern. Top-level construction gets evaluated at build time for every page that transitively imports the module (most of them, via Server Actions), which both warns noisily when the API key is empty and does needless work for routes that never call it.
- AI-generated resume/cover-letter content flows through the `Block[]` shape in `lib/gemini/schemas.ts`, not raw Tiptap JSON — see `lib/tiptap/fromBlocks.ts` and `toPlainText.ts`. Reuse those converters for any new AI-generation feature rather than inventing another intermediate format.
- Tailored/AI-generated documents are `is_base: false` rows (via `insertDocument`, not `createBaseDocument`) and never count against tier limits — only the true "base" documents a user manually creates do. They **must** also set `base_resume_id`/`base_cover_letter_id` (via `insertDocument`'s `extra` param) pointing at a real base document — that's the only thing that makes them discoverable again (`listTailoredDocuments` / `TailoredVersionsList`). A non-base document with no parent link is permanently unreachable in the current UI; this was a real bug found and fixed in Phase 2, not a hypothetical.
- **No per-user rate limiting exists yet** on Gemini-calling actions (`tailorResume`, `generateCoverLetter`) — a free-tier user can currently generate unlimited AI content at real (paid-tier) API cost with no monetization gate. This is flagged as a pre-launch item in `PROGRESS.md`'s Phase 5, not fixed yet; don't assume it's handled. (Separately, every Gemini call site *does* now retry on a 429 from Google's own side — see `lib/gemini/retryOnRateLimit.ts` — which is about resilience to the API's rate limit, not about limiting our own users.)
- Never commit real API keys — use `.env.local` (gitignored) and document required vars in `.env.example`.
- Free-tier limits (3 resumes / 1 cover letter) live in `lib/documents/db.ts`'s `BASE_LIMITS` — change them there, not in individual pages.

## Memory Directive
After completing any non-trivial task (new feature, refactor, bug fix, dependency/schema change), update `PROGRESS.md`:
- Move finished items from "Immediate Backlog" into "Recent Session Activity" with a one-line summary and date.
- Keep "Current State" accurate — rewrite it if the project's shape changed materially.
- Do not log routine/trivial edits (typos, formatting) — only meaningful work.

## PR Workflow
Phase work happens on its own branch (`phase-N`), **never committed directly to `main`** — `main` is protected (see below) and shouldn't be pushed to directly anyway.

**Starting a new phase** — do this automatically as the first step, without being asked:
1. `git status` — confirm no uncommitted work is about to be lost.
2. `git checkout main && git pull origin main` — get the just-merged previous phase.
3. `git fetch --prune` — clear stale remote-tracking refs for branches deleted on GitHub after merge.
4. `git branch -d phase-<N-1>` — delete the previous phase's local branch. Use `-d` (safe delete), not `-D` — if it refuses because the branch isn't fully merged into `main`, stop and surface that to the user rather than force-deleting; it means something didn't land.
5. `git checkout -b phase-<N> && git push -u origin phase-<N>`.
6. Verify: `git branch -a` should show exactly one local branch (`phase-<N>`, checked out) and no leftover `phase-<N-1>` refs.

**Testing gate — non-negotiable before any merge to `main`:** `lint` + `tsc --noEmit` + `test` + `build` passing is necessary but not sufficient by itself for anything that touches user-facing behavior (a new feature, a UI flow, an integration). For those, also write and run a real Playwright e2e test that exercises the actual flow in a real browser against the live dev server and real backends (Supabase, Gemini) — not just a unit test of the underlying function. `lib/gemini/tailorResume.ts` passing its Zod schema doesn't mean the "Tailor for a job" button on the page actually works; only clicking it does. Pure logic/utility changes (a converter, a bug fix in a helper) can rely on unit tests alone — use judgment, but default to e2e for anything a user would click through. e2e tests that create data should create their own throwaway fixtures (e.g. a test user via the Supabase admin API) and delete them in `afterAll` — never assume a clean slate, never leave test data behind.

**Finishing a phase** — when a phase's checklist in `PROGRESS.md` is fully checked off, prepare it for review, again without being asked:
1. Run the testing gate above.
2. Commit and push the branch.
3. Draft a PR description covering: Summary, bugs found and fixed (if any — call these out explicitly, don't bury them), what's deliberately out of scope, and what testing was actually performed vs. still outstanding.
4. `gh` CLI isn't available in this environment — surface the PR title + body as copy-pasteable text, plus the `github.com/<owner>/<repo>/pull/new/<branch>` compare URL, rather than trying to run `gh pr create`.

**`main` branch protection:** the user wants `main` un-editable except via merged PRs. This has to be configured as a GitHub ruleset (Settings → Rules → Rulesets) — there is no git-level or local setting that enforces it, and this environment has no `gh` CLI or API token to set it up automatically, so it's a manual step for the user. If a repo ruleset for `main` isn't confirmed active, say so instead of assuming it's in place — this is not a substitute for actually checking.
