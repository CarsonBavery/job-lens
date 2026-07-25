# CLAUDE.md — JobLens

## Product
JobLens is an AI-assisted job search platform: resume & cover letter maintenance (Gemini-tailored per posting), application tracking, and a deduplicated multi-source job board aggregator. Free tier: 3 base resumes + 1 cover letter. Paid tier: higher storage/usage limits, later licensed job-source coverage.

**Status:** Phase 1 merged to `main` 2026-07-25. Phase 2 (AI features) built and **live-verified** on branch `phase-2`, not yet merged: Gemini-powered resume tailoring and cover letter generation both confirmed working end-to-end against the real API (grounded, no fabrication observed). Job-to-resume match scoring was pushed to Phase 3 (needs real job postings to score against). `lint`/`tsc`/`test`/`build` all pass. Nobody has clicked through either AI feature in the browser yet — only the underlying Gemini calls have been verified directly, not the UI wiring. See `PROGRESS.md` for the phased backlog and what's left.

## Tech Stack
- **Framework:** Next.js 15 (App Router, Turbopack), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS 4
- **Backend/data:** Supabase — Postgres, Auth, Storage (resume/cover-letter files), pgvector (embeddings for dedup + job/resume matching)
- **AI:** Google Gemini via `@google/genai`, structured output validated with Zod
- **Document editor:** Tiptap (ProseMirror) — resumes/cover letters are edited as rich text in-app (Word-like WYSIWYG), stored as Tiptap/ProseMirror JSON in Postgres (`content` column), exported to real `.docx` on demand via the `docx` npm package. No `.docx` *import* yet (create-in-editor only for now, by design).
- **Payments:** Stripe (subscriptions, tiered limits)
- **Job ingestion:** direct free ATS APIs only — Greenhouse, Lever, Ashby, Workable. **No LinkedIn/Indeed scraping** — Indeed retired its public API in 2024 and LinkedIn has never offered one; scraping either violates ToS. A licensed aggregator (e.g. TheirStack) is the planned path to add that coverage later, gated behind the paid tier.
- **Deployment:** Vercel (cron for scheduled ATS ingestion)
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
- `lib/supabase/server.ts` — server client (Server Components/Route Handlers) + `createServiceRoleClient()` for RLS-bypassing jobs (ingestion, webhooks)
- `lib/supabase/middleware.ts` — session-refresh helper used by `middleware.ts`
- `lib/auth/actions.ts` — sign in/up/out Server Actions (Zod-validated)
- `lib/documents/db.ts` — shared CRUD + tier-limit helpers used by both resumes and cover letters (the two tables only differ in a couple of type-specific columns)
- `lib/resumes/actions.ts`, `lib/cover-letters/actions.ts` — thin per-entity Server Action wrappers around `lib/documents/db.ts`
- `lib/tiptap/toDocx.ts` — converts Tiptap/ProseMirror JSON to a `.docx` buffer
- `lib/tiptap/toPlainText.ts` — Tiptap JSON → plain text, used to feed a document's current content to Gemini as prompt context
- `lib/tiptap/fromBlocks.ts` — converts Gemini's structured block output back into Tiptap JSON (groups consecutive `bullet` blocks into one `bulletList`)
- `lib/gemini/client.ts` — `getGeminiClient()` (lazy singleton — see Code Conventions) + model name constants. Uses Google's rolling aliases (`gemini-flash-latest`, `gemini-embedding-001`), not pinned snapshots — `gemini-2.5-flash` and `text-embedding-004` both 404'd for this project's API key even while still listed by `ListModels`, so pinned names aren't safe to assume stay valid.
- `lib/gemini/schemas.ts` — the `Block`/`blocksJsonSchema` shape all Gemini generation calls return: flat `{ type, text }[]`, deliberately not raw Tiptap JSON (too easy for a model to get the nested node shape subtly wrong)
- `lib/gemini/generateBlocks.ts` — shared call-Gemini-with-schema-and-validate-the-response helper
- `lib/gemini/tailorResume.ts`, `lib/gemini/generateCoverLetter.ts` — the two prompts, both explicitly instructed not to fabricate experience beyond what's in the source resume
- `lib/stripe/client.ts` — Stripe client
- `lib/ingestion/normalize.ts` — cross-source job dedup key builder (ATS connectors land here in Phase 3)
- `components/auth/GoogleSignInButton.tsx` — client-side OAuth trigger
- `components/editor/DocumentEditor.tsx`, `EditorToolbar.tsx` — the Tiptap editor UI, autosaves 1s after the user stops typing
- `types/database.ts` — hand-written Supabase `Database` type; regenerate with `supabase gen types` once a live project exists. **Must include `Views`/`Functions`/`Enums`/`CompositeTypes` and per-table `Relationships: []`** even though this schema uses none of them — omitting any of those silently collapses query result types to `never` instead of erroring (cost real debugging time once already).
- `supabase/migrations/0001_init.sql` — full schema, apply via Supabase CLI or SQL editor
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

**Running Playwright (`test:e2e`):** this project directory lives inside OneDrive sync, which locks files in `test-results/` between runs and can make Playwright's own cleanup fail with `EPERM: operation not permitted, rmdir`. If a run fails with that error before any test even starts, `rm -rf test-results playwright-report` and rerun — it's a OneDrive artifact, not a real failure. `playwright.config.ts` loads `.env.local` via `process.loadEnvFile()` so e2e tests can talk to Supabase directly (e.g. creating a throwaway test user) — Playwright's Chromium binary itself needs `npx playwright install chromium` once per machine, and that install (like anything hitting the network) must run via the Bash tool, not PowerShell, which has no network access in this environment.

## Code Conventions
- Functional components, default exports for pages/layouts.
- Tailwind utility classes directly in JSX; no CSS modules.
- TypeScript strict mode — avoid `any`, prefer explicit types; Zod schemas double as runtime validation + type source for AI/API boundaries. The two `eslint-disable-next-line @typescript-eslint/no-explicit-any` casts in `lib/documents/db.ts` are a deliberate, contained exception (Supabase's generic query builder can't type a table param that's a union of two differently-shaped tables) — don't spread that pattern elsewhere.
- Mutations go through Server Actions (`lib/*/actions.ts`, `"use server"`), not client-side `fetch` to API routes. API routes (`app/api/`) are reserved for things that need to *return a file/response* a Server Action can't (e.g. `.docx` downloads).
- Use the `@/*` path alias instead of relative `../../` imports.
- Server-side Supabase/Stripe/Gemini calls belong in `lib/`, not inline in route handlers or components.
- Server-only clients (Gemini, and anything similar added later) must be **lazily constructed** behind a function, not built at module top-level — `lib/gemini/client.ts`'s `getGeminiClient()` is the pattern. Top-level construction gets evaluated at build time for every page that transitively imports the module (most of them, via Server Actions), which both warns noisily when the API key is empty and does needless work for routes that never call it.
- AI-generated resume/cover-letter content flows through the `Block[]` shape in `lib/gemini/schemas.ts`, not raw Tiptap JSON — see `lib/tiptap/fromBlocks.ts` and `toPlainText.ts`. Reuse those converters for any new AI-generation feature rather than inventing another intermediate format.
- Tailored/AI-generated documents are `is_base: false` rows (via `insertDocument`, not `createBaseDocument`) and never count against tier limits — only the true "base" documents a user manually creates do.
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
