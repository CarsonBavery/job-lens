# CLAUDE.md — JobLens

## Product
JobLens is an AI-assisted job search platform: resume & cover letter maintenance (Gemini-tailored per posting), application tracking, and a deduplicated multi-source job board aggregator. Free tier: 3 base resumes + 1 cover letter. Paid tier: higher storage/usage limits, later licensed job-source coverage.

**Status:** Phase 0 (project setup) complete as of 2026-07-24 — deps installed, DB schema drafted, client scaffolding and test harness in place. No live Supabase/Stripe/Gemini credentials configured yet and no product features built. See `PROGRESS.md` for the phased backlog.

## Tech Stack
- **Framework:** Next.js 15 (App Router, Turbopack), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS 4
- **Backend/data:** Supabase — Postgres, Auth, Storage (resume/cover-letter files), pgvector (embeddings for dedup + job/resume matching)
- **AI:** Google Gemini via `@google/genai`, structured output validated with Zod
- **Payments:** Stripe (subscriptions, tiered limits)
- **Job ingestion:** direct free ATS APIs only — Greenhouse, Lever, Ashby, Workable. **No LinkedIn/Indeed scraping** — Indeed retired its public API in 2024 and LinkedIn has never offered one; scraping either violates ToS. A licensed aggregator (e.g. TheirStack) is the planned path to add that coverage later, gated behind the paid tier.
- **Deployment:** Vercel (cron for scheduled ATS ingestion)
- **Testing:** Vitest (unit, `*.test.ts` colocated with source) + Playwright (e2e, `e2e/`)

Full rationale for these choices lives in persistent memory (`joblens-stack-decision`), not here — this file is the current-state reference.

## Architecture Map
- `app/` — routes (App Router)
- `middleware.ts` — refreshes the Supabase auth session cookie on every request
- `lib/supabase/client.ts` — browser client (Client Components)
- `lib/supabase/server.ts` — server client (Server Components/Route Handlers) + `createServiceRoleClient()` for RLS-bypassing jobs (ingestion, webhooks)
- `lib/supabase/middleware.ts` — session-refresh helper used by `middleware.ts`
- `lib/gemini/client.ts` — Gemini client + model name constants
- `lib/stripe/client.ts` — Stripe client
- `lib/ingestion/normalize.ts` — cross-source job dedup key builder (ATS connectors land here in Phase 3)
- `types/database.ts` — hand-written Supabase `Database` type; regenerate with `supabase gen types` once a live project exists
- `supabase/migrations/0001_init.sql` — full schema, apply via Supabase CLI or SQL editor
- `public/` — static assets
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

## Code Conventions
- Functional components, default exports for pages/layouts.
- Tailwind utility classes directly in JSX; no CSS modules.
- TypeScript strict mode — avoid `any`, prefer explicit types; Zod schemas double as runtime validation + type source for AI/API boundaries.
- Use the `@/*` path alias instead of relative `../../` imports.
- Server-side Supabase/Stripe/Gemini calls belong in `lib/`, not inline in route handlers or components.
- Never commit real API keys — use `.env.local` (gitignored) and document required vars in `.env.example`.

## Memory Directive
After completing any non-trivial task (new feature, refactor, bug fix, dependency/schema change), update `PROGRESS.md`:
- Move finished items from "Immediate Backlog" into "Recent Session Activity" with a one-line summary and date.
- Keep "Current State" accurate — rewrite it if the project's shape changed materially.
- Do not log routine/trivial edits (typos, formatting) — only meaningful work.
